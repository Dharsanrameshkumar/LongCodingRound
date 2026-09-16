package com.eventbooking.backend.dto;

public class LoginResponse {
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long profileId;  // studentId or organizerId

    public LoginResponse(Long userId, String name, String email, String role, Long profileId) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profileId = profileId;
    }

    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getProfileId() { return profileId; }
}
