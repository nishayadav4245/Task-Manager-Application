package com.nexus.projectmanagement.dto;

import com.nexus.projectmanagement.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
  private AuthDtos() {}

  public record SignupRequest(
      @NotBlank String name,
      @Email @NotBlank String email,
      @Size(min = 6) String password,
      @NotNull Role role
  ) {}

  public record LoginRequest(
      @Email @NotBlank String email,
      @NotBlank String password
  ) {}

  public record AuthResponse(
      String token,
      UserResponse user
  ) {}
}