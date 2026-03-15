package com.pawnote.auth.naver;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TempNaverLoginStore {

    public static class TempLoginData {
        private final Long userId;
        private final String email;
        private final String name;
        private final Instant expiresAt;

        public TempLoginData(Long userId, String email, String name, Instant expiresAt) {
            this.userId = userId;
            this.email = email;
            this.name = name;
            this.expiresAt = expiresAt;
        }

        public Long getUserId() {
            return userId;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public Instant getExpiresAt() {
            return expiresAt;
        }
    }

    private final Map<String, TempLoginData> store = new ConcurrentHashMap<>();

    public String save(Long userId, String email, String name) {
        String loginToken = UUID.randomUUID().toString();
        store.put(
                loginToken,
                new TempLoginData(userId, email, name, Instant.now().plusSeconds(300))
        );
        return loginToken;
    }

    public TempLoginData consume(String loginToken) {
        TempLoginData data = store.remove(loginToken);

        if (data == null) {
            return null;
        }

        if (data.getExpiresAt().isBefore(Instant.now())) {
            return null;
        }

        return data;
    }
}
