package com.nexus.projectmanagement.dto;

import com.nexus.projectmanagement.domain.Role;

public record UserResponse(
    Long id,
    String name,
    String email,
    Role role,
    String avatar
) {}