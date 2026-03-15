package com.pawnote.auth;

import com.pawnote.auth.dto.AuthResponse;
import com.pawnote.auth.dto.google.GoogleLoginRequest;
import com.pawnote.auth.dto.naver.NaverLoginRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pawnote.auth.dto.kakao.KakaoLoginRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        log.info("구글 로그인 요청 들어옴");
        AuthResponse response = authService.loginWithGoogle(request.getIdToken());
        log.info("구글 로그인 성공 userId={}", response.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/naver/start")
    public ResponseEntity<Void> startNaverLogin() {
        log.info("네이버 로그인 시작 요청");

        String authorizeUrl = authService.getNaverAuthorizeUrl();

        log.info("네이버 authorize URL 생성 완료: {}", authorizeUrl);

        return ResponseEntity.status(302)
                .header(HttpHeaders.LOCATION, authorizeUrl)
                .build();
    }

    @GetMapping("/naver/callback")
    public ResponseEntity<Void> naverCallback(
            @RequestParam String code,
            @RequestParam String state
    ) {
        log.info("네이버 callback 호출");
        log.info("code={}", code);
        log.info("state={}", state);

        String appRedirectUrl = authService.handleNaverCallback(code, state);

        log.info("앱으로 리다이렉트: {}", appRedirectUrl);

        return ResponseEntity.status(302)
                .location(URI.create(appRedirectUrl))
                .build();
    }

    @PostMapping("/naver/exchange")
    public ResponseEntity<AuthResponse> exchangeNaverLogin(@RequestBody NaverLoginRequest request) {
        log.info("네이버 loginToken 교환 요청");
        AuthResponse response = authService.exchangeNaverLogin(request.getLoginToken());
        log.info("네이버 로그인 완료 userId={}", response.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/kakao/callback")
    public void handleKakaoCallback(
            @RequestParam String code,
            HttpServletResponse response
    ) throws Exception {
        String redirectUrl = authService.handleKakaoCallback(code);
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/kakao/exchange")
    public ResponseEntity<AuthResponse> exchangeKakaoLogin(
            @RequestBody KakaoLoginRequest request
    ) {
        return ResponseEntity.ok(authService.exchangeKakaoLogin(request.getLoginToken()));
    }
}
