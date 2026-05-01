package com.nexus.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public final class ProjectDtos {
  private ProjectDtos() {}

  public record ProjectRequest(
      @NotBlank String name,
      String description,
      @NotBlank String client,
      @NotNull LocalDate deadline,
      List<Long> memberIds
  ) {}

  public record ProjectResponse(
      Long id,
      String name,
      String description,
      String client,
      LocalDate deadline,
      UserResponse createdBy,
      List<UserResponse> members,
      long taskCount,
      long completedTaskCount,
      int progress
  ) {}
}