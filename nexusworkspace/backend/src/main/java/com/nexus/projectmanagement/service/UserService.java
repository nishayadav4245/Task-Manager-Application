package com.nexus.projectmanagement.service;

import com.nexus.projectmanagement.domain.Role;
import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.dto.AuthDtos.SignupRequest;
import com.nexus.projectmanagement.dto.UserResponse;
import com.nexus.projectmanagement.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public List<UserResponse> listUsers() {
    return userRepository.findAll().stream()
        .sorted(Comparator.comparing(UserEntity::getName))
        .map(ApiMapper::toUserResponse)
        .toList();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @Transactional
  public UserResponse createUser(SignupRequest request) {
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
    return ApiMapper.toUserResponse(userRepository.save(user));
  }

  private String initials(String name) {
    String[] parts = name.trim().split("\\s+");
    if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  }
}