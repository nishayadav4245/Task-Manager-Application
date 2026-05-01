package com.nexus.projectmanagement.security;

import com.nexus.projectmanagement.domain.UserEntity;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
  private final String secret;
  private final long expirationMinutes;

  public TokenService(
      @Value("${app.security.token-secret}") String secret,
      @Value("${app.security.token-expiration-minutes}") long expirationMinutes
  ) {
    this.secret = secret;
    this.expirationMinutes = expirationMinutes;
  }

  public String createToken(UserEntity user) {
    long expiresAt = Instant.now().plusSeconds(expirationMinutes * 60).getEpochSecond();
    String payload = user.getId() + ":" + user.getRole().name() + ":" + expiresAt;
    String encodedPayload = base64Url(payload.getBytes(StandardCharsets.UTF_8));
    return encodedPayload + "." + sign(encodedPayload);
  }

  public TokenData parseToken(String token) {
    String[] parts = token.split("\\.");
    if (parts.length != 2 || !constantTimeEquals(parts[1], sign(parts[0]))) {
      throw new IllegalArgumentException("Invalid token");
    }

    String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
    String[] values = payload.split(":");
    if (values.length != 3) throw new IllegalArgumentException("Invalid token payload");

    long expiresAt = Long.parseLong(values[2]);
    if (Instant.ofEpochSecond(expiresAt).isBefore(Instant.now())) {
      throw new IllegalArgumentException("Token expired");
    }

    return new TokenData(Long.parseLong(values[0]), values[1], Instant.ofEpochSecond(expiresAt));
  }

  private String sign(String value) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return base64Url(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception ex) {
      throw new IllegalStateException("Unable to sign token", ex);
    }
  }

  private String base64Url(byte[] bytes) {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private boolean constantTimeEquals(String left, String right) {
    if (left.length() != right.length()) return false;
    int result = 0;
    for (int i = 0; i < left.length(); i++) {
      result |= left.charAt(i) ^ right.charAt(i);
    }
    return result == 0;
  }

  public record TokenData(Long userId, String role, Instant expiresAt) {}
}