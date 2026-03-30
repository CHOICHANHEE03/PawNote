package com.pawnote.auth.dto.naver;

public class NaverLoginRequest {

    private String loginToken;

    public NaverLoginRequest() {
    }

    public String getLoginToken() {
        return loginToken;
    }

    public void setLoginToken(String loginToken) {
        this.loginToken = loginToken;
    }
}
