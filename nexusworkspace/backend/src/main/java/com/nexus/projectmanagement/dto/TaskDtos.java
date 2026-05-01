package com.nexus.projectmanagement.dto;

import com.nexus.projectmanagement.domain.TaskPriority;
import com.nexus.projectmanagement.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public final class TaskDtos {
  private TaskDtos() {}

  public record TaskRequest(
      @NotNull Long projectId,
      @NotBlank String title,
      String description,
      Long assignedToId,
      TaskPriority priority,
      @NotNull LocalDate dueDate
  ) {}

  public record TaskStatusUpdateRequest(
      @NotNull TaskStatus status
  ) {}

  public record TaskResponse(
      Long id,
      Long projectId,
      String projectName,
      String title,
      String description,
      UserResponse assignedTo,
      UserResponse createdBy,
      TaskStatus status,
      TaskPriority priority,
      LocalDate dueDate,
      boolean overdue
  ) {}
}