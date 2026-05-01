package com.nexus.projectmanagement.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> fieldErrors = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));
    return error(HttpStatus.BAD_REQUEST, "Validation failed", fieldErrors);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
    String message = ex.getMessage() == null ? "Bad request" : ex.getMessage();
    HttpStatus status = message.toLowerCase().contains("access denied") ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST;
    return error(status, message, null);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
    return error(HttpStatus.FORBIDDEN, "Access denied", null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", null);
  }

  private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message, Object details) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("message", message);
    if (details != null) body.put("details", details);
    return ResponseEntity.status(status).body(body);
  }
}