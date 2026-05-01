package com.nexus.projectmanagement.service;

import com.nexus.projectmanagement.domain.Project;
import com.nexus.projectmanagement.domain.Role;
import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.dto.ProjectDtos.ProjectRequest;
import com.nexus.projectmanagement.dto.ProjectDtos.ProjectResponse;
import com.nexus.projectmanagement.repository.ProjectRepository;
import com.nexus.projectmanagement.repository.TaskRepository;
import com.nexus.projectmanagement.repository.UserRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
  private final ProjectRepository projectRepository;
  private final TaskRepository taskRepository;
  private final UserRepository userRepository;
  private final AuthenticatedUserService authenticatedUserService;

  public ProjectService(
      ProjectRepository projectRepository,
      TaskRepository taskRepository,
      UserRepository userRepository,
      AuthenticatedUserService authenticatedUserService
  ) {
    this.projectRepository = projectRepository;
    this.taskRepository = taskRepository;
    this.userRepository = userRepository;
    this.authenticatedUserService = authenticatedUserService;
  }

  @Transactional(readOnly = true)
  public List<ProjectResponse> listProjects() {
    UserEntity current = authenticatedUserService.currentUser();
    List<Project> projects = current.getRole() == Role.ADMIN
        ? projectRepository.findAll()
        : projectRepository.findVisibleToMember(current.getId());

    return projects.stream()
        .map(project -> ApiMapper.toProjectResponse(project, taskRepository))
        .toList();
  }

  @Transactional(readOnly = true)
  public ProjectResponse getProject(Long id) {
    UserEntity current = authenticatedUserService.currentUser();
    Project project = findProject(id);
    requireVisible(current, project);
    return ApiMapper.toProjectResponse(project, taskRepository);
  }

  @Transactional
  public ProjectResponse createProject(ProjectRequest request) {
    UserEntity current = reload(authenticatedUserService.currentUser());

    Project project = new Project();
    project.setName(request.name().trim());
    project.setDescription(clean(request.description()));
    project.setClient(request.client().trim());
    project.setDeadline(request.deadline());
    project.setCreatedBy(current);
    List<Long> memberIds = current.getRole() == Role.ADMIN ? request.memberIds() : List.of();
    project.setMembers(resolveMembers(current, memberIds, true));

    return ApiMapper.toProjectResponse(projectRepository.save(project), taskRepository);
  }

  @Transactional
  public ProjectResponse updateProject(Long id, ProjectRequest request) {
    UserEntity current = authenticatedUserService.currentUser();
    Project project = findProject(id);
    requireCanManage(current, project);

    project.setName(request.name().trim());
    project.setDescription(clean(request.description()));
    project.setClient(request.client().trim());
    project.setDeadline(request.deadline());

    if (current.getRole() == Role.ADMIN) {
      project.setMembers(resolveMembers(project.getCreatedBy(), request.memberIds(), true));
    }

    return ApiMapper.toProjectResponse(project, taskRepository);
  }

  @Transactional
  public void deleteProject(Long id) {
    UserEntity current = authenticatedUserService.currentUser();
    Project project = findProject(id);
    requireCanManage(current, project);

    taskRepository.deleteAll(taskRepository.findByProjectId(project.getId()));
    projectRepository.delete(project);
  }

  private Project findProject(Long id) {
    return projectRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Project not found"));
  }

  private UserEntity reload(UserEntity user) {
    return userRepository.findById(user.getId())
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
  }

  private Set<UserEntity> resolveMembers(UserEntity owner, List<Long> memberIds, boolean includeOwner) {
    Set<UserEntity> members = new LinkedHashSet<>();
    if (includeOwner) members.add(reload(owner));

    if (memberIds != null) {
      for (Long memberId : memberIds) {
        members.add(userRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId)));
      }
    }

    return members;
  }

  private void requireVisible(UserEntity current, Project project) {
    if (current.getRole() == Role.ADMIN) return;
    boolean member = project.getMembers().stream().anyMatch(user -> user.getId().equals(current.getId()));
    boolean owner = project.getCreatedBy().getId().equals(current.getId());
    if (!member && !owner) throw new IllegalArgumentException("Access denied to project");
  }

  private void requireCanManage(UserEntity current, Project project) {
    if (current.getRole() == Role.ADMIN) return;
    if (!project.getCreatedBy().getId().equals(current.getId())) {
      throw new IllegalArgumentException("Only admins or project owners can manage this project");
    }
  }

  private String clean(String value) {
    return value == null ? null : value.trim();
  }
}