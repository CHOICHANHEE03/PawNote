package com.pawnote.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.pawnote.auth.dto.AuthResponse;
import com.pawnote.auth.google.GoogleTokenVerifier;
import com.pawnote.auth.jwt.JwtTokenProvider;
import com.pawnote.auth.naver.TempNaverLoginStore;
import com.pawnote.user.User;
import com.pawnote.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TempNaverLoginStore tempNaverLoginStore;

    @Value("${naver.client-id}")
    private String naverClientId;

    @Value("${naver.client-secret}")
    private String naverClientSecret;

    @Value("${naver.redirect-uri}")
    private String naverRedirectUri;

    @Value("${naver.app-redirect-uri}")
    private String naverAppRedirectUri;

    private final WebClient webClient = WebClient.builder().build();

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        try {
            log.info("구글 로그인 처리 시작");

            GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);

            if (payload == null) {
                throw new RuntimeException("유효하지 않은 구글 ID 토큰입니다.");
            }

            String providerId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            log.info("구글 사용자 정보 providerId={}, email={}, name={}", providerId, email, name);

            User user = userRepository.findByProviderAndProviderId("google", providerId)
                    .orElseGet(() -> {
                        log.info("신규 구글 사용자 저장");
                        return userRepository.save(
                                User.builder()
                                        .provider("google")
                                        .providerId(providerId)
                                        .email(email)
                                        .name(name)
                                        .build()
                        );
                    });

            String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());

            log.info("구글 로그인 완료 userId={}", user.getId());

            return new AuthResponse(
                    accessToken,
                    user.getId(),
                    user.getEmail(),
                    user.getName()
            );
        } catch (Exception e) {
            log.error("구글 로그인 처리 중 오류", e);
            throw new RuntimeException("구글 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    public String getNaverAuthorizeUrl() {
        log.info("네이버 authorize URL 생성 시작");

        String state = UUID.randomUUID().toString();

        String url = "https://nid.naver.com/oauth2.0/authorize"
                + "?response_type=code"
                + "&client_id=" + encode(naverClientId)
                + "&redirect_uri=" + encode(naverRedirectUri)
                + "&state=" + encode(state);

        log.info("네이버 authorize URL: {}", url);

        return url;
    }

    @Transactional
    public String handleNaverCallback(String code, String state) {
        try {
            log.info("네이버 콜백 처리 시작");
            log.info("인가 코드 code={}", code);
            log.info("state={}", state);

            Map<String, Object> tokenResponse = requestNaverAccessToken(code, state);
            log.info("네이버 토큰 응답: {}", tokenResponse);

            String accessToken = (String) tokenResponse.get("access_token");

            if (accessToken == null || accessToken.isBlank()) {
                throw new RuntimeException("네이버 access token 발급에 실패했습니다.");
            }

            Map<String, Object> profileResponse = requestNaverUserInfo(accessToken);
            log.info("네이버 유저 정보 응답: {}", profileResponse);

            Map<String, Object> response = (Map<String, Object>) profileResponse.get("response");

            if (response == null) {
                throw new RuntimeException("네이버 사용자 정보 조회에 실패했습니다.");
            }

            String providerId = (String) response.get("id");
            String email = (String) response.get("email");
            String name = (String) response.get("name");

            log.info("네이버 사용자 정보 providerId={}, email={}, name={}", providerId, email, name);

            User user = userRepository.findByProviderAndProviderId("naver", providerId)
                    .orElseGet(() -> {
                        log.info("신규 네이버 사용자 저장");
                        return userRepository.save(
                                User.builder()
                                        .provider("naver")
                                        .providerId(providerId)
                                        .email(email)
                                        .name(name)
                                        .build()
                        );
                    });

            String loginToken = tempNaverLoginStore.save(
                    user.getId(),
                    user.getEmail(),
                    user.getName()
            );

            log.info("임시 loginToken 생성 완료: {}", loginToken);

            String redirectUrl = naverAppRedirectUri + "?loginToken=" + encode(loginToken);

            log.info("앱 리다이렉트 URL: {}", redirectUrl);

            return redirectUrl;
        } catch (Exception e) {
            log.error("네이버 로그인 처리 중 오류", e);
            throw new RuntimeException("네이버 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    public AuthResponse exchangeNaverLogin(String loginToken) {
        log.info("네이버 loginToken 교환 시작");

        TempNaverLoginStore.TempLoginData data = tempNaverLoginStore.consume(loginToken);

        if (data == null) {
            throw new RuntimeException("유효하지 않거나 만료된 loginToken 입니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(data.getUserId(), data.getEmail());

        log.info("네이버 loginToken 교환 완료 userId={}", data.getUserId());

        return new AuthResponse(
                accessToken,
                data.getUserId(),
                data.getEmail(),
                data.getName()
        );
    }

    private Map<String, Object> requestNaverAccessToken(String code, String state) {
        log.info("네이버 access token 요청 시작");

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("nid.naver.com")
                        .path("/oauth2.0/token")
                        .queryParam("grant_type", "authorization_code")
                        .queryParam("client_id", naverClientId)
                        .queryParam("client_secret", naverClientSecret)
                        .queryParam("code", code)
                        .queryParam("state", state)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private Map<String, Object> requestNaverUserInfo(String accessToken) {
        log.info("네이버 사용자 정보 요청 시작");

        return webClient.get()
                .uri("https://openapi.naver.com/v1/nid/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}