package com.nexus.projectmanagement.controller;

import com.nexus.projectmanagement.dto.TaskDtos.TaskRequest;
import com.nexus.projectmanagement.dto.TaskDtos.TaskResponse;
import com.nexus.projectmanagement.dto.TaskDtos.TaskStatusUpdateRequest;
import com.nexus.projectmanagement.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @GetMapping
  public List<TaskResponse> listTasks(@RequestParam(required = false) Long projectId) {
    return taskService.listTasks(projectId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TaskResponse createTask(@Valid @RequestBody TaskRequest request) {
    return taskService.createTask(request);
  }

  @PutMapping("/{id}")
  public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
    return taskService.updateTask(id, request);
  }

  @PatchMapping("/{id}/status")
  public TaskResponse updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
    return taskService.updateStatus(id, request.status());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteTask(@PathVariable Long id) {
    taskService.deleteTask(id);
  }
}