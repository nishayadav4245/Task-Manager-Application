package com.nexus.projectmanagement.security;

import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {
  private final TokenService tokenService;
  private final UserRepository userRepository;

  public TokenAuthenticationFilter(TokenService tokenService, UserRepository userRepository) {
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      try {
        TokenService.TokenData tokenData = tokenService.parseToken(header.substring(7));
        UserEntity user = userRepository.findById(tokenData.userId()).orElse(null);
        if (user != null) {
          UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
              user,
              null,
              List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
          );
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      } catch (RuntimeException ignored) {
        SecurityContextHolder.clearContext();
      }
    }

    filterChain.doFilter(request, response);
  }
}