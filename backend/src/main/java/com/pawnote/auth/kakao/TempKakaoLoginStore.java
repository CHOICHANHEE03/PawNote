package com.pawnote.auth.kakao;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TempKakaoLoginStore {

    private final Map<String, TempLoginData> store = new ConcurrentHashMap<>();

    public String save(Long userId, String email, String name) {
        String loginToken = UUID.randomUUID().toString();
        store.put(loginToken, new TempLoginData(userId, email, name));
        return loginToken;
    }

    public TempLoginData consume(String loginToken) {
        return store.remove(loginToken);
    }

    public static class TempLoginData {
        private final Long userId;
        private final String email;
        private final String name;

        public TempLoginData(Long userId, String email, String name) {
            this.userId = userId;
            this.email = email;
            this.name = name;
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
    }
}