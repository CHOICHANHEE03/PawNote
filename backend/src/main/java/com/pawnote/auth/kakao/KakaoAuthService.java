package com.pawnote.auth.kakao;

import com.pawnote.auth.dto.kakao.KakaoTokenResponse;
import com.pawnote.auth.dto.kakao.KakaoUserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class KakaoAuthService {

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    @Value("${kakao.app-redirect-uri}")
    private String kakaoAppRedirectUri;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public KakaoUserResponse login(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(params, headers);

        ResponseEntity<KakaoTokenResponse> tokenResponse =
                restTemplate.postForEntity(
                        tokenUrl,
                        request,
                        KakaoTokenResponse.class
                );


        KakaoTokenResponse tokenBody = tokenResponse.getBody();
        if (tokenBody == null || tokenBody.getAccessToken() == null) {
            throw new IllegalStateException("카카오 access token을 가져오지 못했습니다.");
        }

        String accessToken = tokenBody.getAccessToken();

        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);

        HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

        ResponseEntity<KakaoUserResponse> userResponse =
                restTemplate.exchange(
                        "https://kapi.kakao.com/v2/user/me",
                        HttpMethod.GET,
                        userRequest,
                        KakaoUserResponse.class
                );

        KakaoUserResponse userBody = userResponse.getBody();
        if (userBody == null) {
            throw new IllegalStateException("카카오 사용자 정보를 가져오지 못했습니다.");
        }

        return userBody;
    }
}