package com.nexus.projectmanagement.service;

import com.nexus.projectmanagement.domain.UserEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {
  public UserEntity currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof UserEntity user)) {
      throw new IllegalArgumentException("Authenticated user not found");
    }
    return user;
  }
}