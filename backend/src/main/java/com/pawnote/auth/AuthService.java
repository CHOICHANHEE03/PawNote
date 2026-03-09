package com.pawnote.auth;

import com.pawnote.auth.dto.AuthResponse;
import com.pawnote.auth.google.GoogleTokenVerifier;
import com.pawnote.auth.jwt.JwtTokenProvider;
import com.pawnote.user.User;
import com.pawnote.user.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        try {
            GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);

            String providerId = payload.getSubject(); // sub
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepository.findByProviderAndProviderId("google", providerId)
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .provider("google")
                                    .providerId(providerId)
                                    .email(email)
                                    .name(name)
                                    .build()
                    ));

            String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());

            return new AuthResponse(
                    accessToken,
                    user.getId(),
                    user.getEmail(),
                    user.getName()
            );
        } catch (Exception e) {
            throw new RuntimeException("구글 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}
