package com.nexus.projectmanagement.service;

import com.nexus.projectmanagement.domain.Project;
import com.nexus.projectmanagement.domain.Role;
import com.nexus.projectmanagement.domain.Task;
import com.nexus.projectmanagement.domain.TaskPriority;
import com.nexus.projectmanagement.domain.TaskStatus;
import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.dto.TaskDtos.TaskRequest;
import com.nexus.projectmanagement.dto.TaskDtos.TaskResponse;
import com.nexus.projectmanagement.repository.ProjectRepository;
import com.nexus.projectmanagement.repository.TaskRepository;
import com.nexus.projectmanagement.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {
  private final TaskRepository taskRepository;
  private final ProjectRepository projectRepository;
  private final UserRepository userRepository;
  private final AuthenticatedUserService authenticatedUserService;

  public TaskService(
      TaskRepository taskRepository,
      ProjectRepository projectRepository,
      UserRepository userRepository,
      AuthenticatedUserService authenticatedUserService
  ) {
    this.taskRepository = taskRepository;
    this.projectRepository = projectRepository;
    this.userRepository = userRepository;
    this.authenticatedUserService = authenticatedUserService;
  }

  @Transactional(readOnly = true)
  public List<TaskResponse> listTasks(Long projectId) {
    UserEntity current = authenticatedUserService.currentUser();
    List<Task> tasks;

    if (projectId != null) {
      Project project = findProject(projectId);
      requireProjectVisible(current, project);
      tasks = taskRepository.findByProjectId(projectId);
    } else {
      tasks = current.getRole() == Role.ADMIN
          ? taskRepository.findAll()
          : taskRepository.findVisibleToMember(current.getId());
    }

    return tasks.stream().map(ApiMapper::toTaskResponse).toList();
  }

  @Transactional
  public TaskResponse createTask(TaskRequest request) {
    UserEntity current = reload(authenticatedUserService.currentUser());
    Project project = findProject(request.projectId());
    requireProjectVisible(current, project);

    UserEntity assignee = current.getRole() == Role.ADMIN
        ? findUser(requiredAssignee(request.assignedToId()))
        : current;

    requireProjectMember(project, assignee);

    Task task = new Task();
    task.setProject(project);
    task.setTitle(request.title().trim());
    task.setDescription(clean(request.description()));
    task.setAssignedTo(assignee);
    task.setCreatedBy(current);
    task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
    task.setStatus(TaskStatus.BACKLOG);
    task.setDueDate(request.dueDate());

    return ApiMapper.toTaskResponse(taskRepository.save(task));
  }

  @Transactional
  public TaskResponse updateTask(Long id, TaskRequest request) {
    UserEntity current = authenticatedUserService.currentUser();
    Task task = findTask(id);

    if (current.getRole() != Role.ADMIN && !task.getCreatedBy().getId().equals(current.getId())) {
      throw new IllegalArgumentException("Only admins or task creators can edit task details");
    }

    Project project = findProject(request.projectId());
    requireProjectVisible(current, project);

    UserEntity assignee = current.getRole() == Role.ADMIN
        ? findUser(requiredAssignee(request.assignedToId()))
        : reload(current);
    requireProjectMember(project, assignee);

    task.setProject(project);
    task.setTitle(request.title().trim());
    task.setDescription(clean(request.description()));
    task.setAssignedTo(assignee);
    task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
    task.setDueDate(request.dueDate());

    return ApiMapper.toTaskResponse(task);
  }

  @Transactional
  public TaskResponse updateStatus(Long id, TaskStatus status) {
    UserEntity current = authenticatedUserService.currentUser();
    Task task = findTask(id);

    if (current.getRole() != Role.ADMIN && !task.getAssignedTo().getId().equals(current.getId())) {
      throw new IllegalArgumentException("Only admins or assigned users can update task progress");
    }

    task.setStatus(status);
    return ApiMapper.toTaskResponse(task);
  }

  @Transactional
  public void deleteTask(Long id) {
    UserEntity current = authenticatedUserService.currentUser();
    Task task = findTask(id);

    if (current.getRole() != Role.ADMIN && !task.getCreatedBy().getId().equals(current.getId())) {
      throw new IllegalArgumentException("Only admins or task creators can delete tasks");
    }

    taskRepository.delete(task);
  }

  private Long requiredAssignee(Long assignedToId) {
    if (assignedToId == null) throw new IllegalArgumentException("Assignee is required");
    return assignedToId;
  }

  private Project findProject(Long id) {
    return projectRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
  }

  private Task findTask(Long id) {
    return taskRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Task not found"));
  }

  private UserEntity findUser(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
  }

  private UserEntity reload(UserEntity user) {
    return findUser(user.getId());
  }

  private void requireProjectVisible(UserEntity current, Project project) {
    if (current.getRole() == Role.ADMIN) return;
    boolean member = project.getMembers().stream().anyMatch(user -> user.getId().equals(current.getId()));
    boolean owner = project.getCreatedBy().getId().equals(current.getId());
    if (!member && !owner) throw new IllegalArgumentException("Access denied to project");
  }

  private void requireProjectMember(Project project, UserEntity assignee) {
    boolean member = project.getMembers().stream().anyMatch(user -> user.getId().equals(assignee.getId()));
    if (!member) throw new IllegalArgumentException("Assignee must be a member of the project");
  }

  private String clean(String value) {
    return value == null ? null : value.trim();
  }
}