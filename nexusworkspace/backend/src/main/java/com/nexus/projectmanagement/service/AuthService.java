package com.nexus.projectmanagement.service;

import com.nexus.projectmanagement.domain.Role;
import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.dto.AuthDtos.AuthResponse;
import com.nexus.projectmanagement.dto.AuthDtos.LoginRequest;
import com.nexus.projectmanagement.dto.AuthDtos.SignupRequest;
import com.nexus.projectmanagement.repository.UserRepository;
import com.nexus.projectmanagement.security.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final TokenService tokenService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.tokenService = tokenService;
  }

  @Transactional
  public AuthResponse signup(SignupRequest request) {
    String email = request.email().trim().toLowerCase();
    if (userRepository.existsByEmail(email)) {
      throw new IllegalArgumentException("Email already registered");
    }

    UserEntity user = new UserEntity();
    user.setName(request.name().trim());
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setRole(request.role() == null ? Role.MEMBER : request.role());
    user.setAvatar(initials(request.name()));

    UserEntity saved = userRepository.save(user);
    return new AuthResponse(tokenService.createToken(saved), ApiMapper.toUserResponse(saved));
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    UserEntity user = userRepository.findByEmail(request.email().trim().toLowerCase())
        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid email or password");
    }

    return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserResponse(user));
  }

  private String initials(String name) {
    String[] parts = name.trim().split("\\s+");
    if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  }
}