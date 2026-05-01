package com.nexus.projectmanagement.service;

import com.nexus.projectmanagement.domain.Task;
import com.nexus.projectmanagement.domain.TaskStatus;
import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.dto.ProjectDtos.ProjectResponse;
import com.nexus.projectmanagement.dto.TaskDtos.TaskResponse;
import com.nexus.projectmanagement.dto.UserResponse;
import com.nexus.projectmanagement.domain.Project;
import com.nexus.projectmanagement.repository.TaskRepository;
import java.time.LocalDate;
import java.util.Comparator;

public class ApiMapper {
  private ApiMapper() {}

  public static UserResponse toUserResponse(UserEntity user) {
    return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAvatar());
  }

  public static ProjectResponse toProjectResponse(Project project, TaskRepository taskRepository) {
    long taskCount = taskRepository.countByProjectId(project.getId());
    long completedTaskCount = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE);
    int progress = taskCount == 0 ? 0 : (int) Math.round((completedTaskCount * 100.0) / taskCount);

    return new ProjectResponse(
        project.getId(),
        project.getName(),
        project.getDescription(),
        project.getClient(),
        project.getDeadline(),
        toUserResponse(project.getCreatedBy()),
        project.getMembers().stream()
            .sorted(Comparator.comparing(UserEntity::getName))
            .map(ApiMapper::toUserResponse)
            .toList(),
        taskCount,
        completedTaskCount,
        progress
    );
  }

  public static TaskResponse toTaskResponse(Task task) {
    boolean overdue = task.getStatus() != TaskStatus.DONE && task.getDueDate().isBefore(LocalDate.now());
    return new TaskResponse(
        task.getId(),
        task.getProject().getId(),
        task.getProject().getName(),
        task.getTitle(),
        task.getDescription(),
        toUserResponse(task.getAssignedTo()),
        toUserResponse(task.getCreatedBy()),
        task.getStatus(),
        task.getPriority(),
        task.getDueDate(),
        overdue
    );
  }
}