package com.pawnote.auth.dto.kakao;

import com.fasterxml.jackson.annotation.JsonProperty;

public class KakaoUserResponse {

    private Long id;

    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;

    public Long getId() {
        return id;
    }

    public KakaoAccount getKakaoAccount() {
        return kakaoAccount;
    }

    public static class KakaoAccount {

        private String email;

        private Profile profile;

        public String getEmail() {
            return email;
        }

        public Profile getProfile() {
            return profile;
        }
    }

    public static class Profile {
        private String nickname;

        public String getNickname() {
            return nickname;
        }
    }
}
