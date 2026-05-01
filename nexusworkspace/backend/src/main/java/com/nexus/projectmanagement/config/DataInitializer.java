package com.nexus.projectmanagement.config;

import com.nexus.projectmanagement.domain.Project;
import com.nexus.projectmanagement.domain.Role;
import com.nexus.projectmanagement.domain.Task;
import com.nexus.projectmanagement.domain.TaskPriority;
import com.nexus.projectmanagement.domain.TaskStatus;
import com.nexus.projectmanagement.domain.UserEntity;
import com.nexus.projectmanagement.repository.ProjectRepository;
import com.nexus.projectmanagement.repository.TaskRepository;
import com.nexus.projectmanagement.repository.UserRepository;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {
  private final UserRepository userRepository;
  private final ProjectRepository projectRepository;
  private final TaskRepository taskRepository;
  private final PasswordEncoder passwordEncoder;

  public DataInitializer(
      UserRepository userRepository,
      ProjectRepository projectRepository,
      TaskRepository taskRepository,
      PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.taskRepository = taskRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (userRepository.count() > 0) return;

    UserEntity admin = createUser("Sarah Admin", "admin@nexus.com", Role.ADMIN, "SA");
    UserEntity member = createUser("John Dev", "member@nexus.com", Role.MEMBER, "JD");
    UserEntity designer = createUser("Mia Design", "designer@nexus.com", Role.MEMBER, "MD");

    Project cloud = createProject(
        "Nexus Cloud Hub",
        "Redesign of the client-facing management cloud architecture.",
        "Stark Labs",
        LocalDate.now().plusMonths(4),
        admin,
        admin,
        member,
        designer
    );

    Project commerce = createProject(
        "E-Commerce Pipeline",
        "Development of robust checkout systems and integrations.",
        "ShopX",
        LocalDate.now().plusMonths(2),
        admin,
        admin,
        member
    );

    createTask(cloud, "Draft API Schemas", "Establish foundational data flow templates.", member, admin, TaskStatus.IN_PROGRESS, TaskPriority.HIGH, LocalDate.now().plusDays(10));
    createTask(cloud, "UI Moodboard Creation", "Consolidate color choices for dynamic rendering.", designer, admin, TaskStatus.DONE, TaskPriority.MEDIUM, LocalDate.now().minusDays(3));
    createTask(commerce, "Integrate Stripe API", "Set up payment flow and validation protocols.", member, admin, TaskStatus.BACKLOG, TaskPriority.HIGH, LocalDate.now().plusDays(7));
    createTask(cloud, "Final Security Audit", "Conduct end-to-end security testing.", admin, admin, TaskStatus.REVIEW, TaskPriority.HIGH, LocalDate.now().plusDays(20));
  }

  private UserEntity createUser(String name, String email, Role role, String avatar) {
    UserEntity user = new UserEntity();
    user.setName(name);
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode("password123"));
    user.setRole(role);
    user.setAvatar(avatar);
    return userRepository.save(user);
  }

  private Project createProject(String name, String description, String client, LocalDate deadline, UserEntity owner, UserEntity... members) {
    Project project = new Project();
    project.setName(name);
    project.setDescription(description);
    project.setClient(client);
    project.setDeadline(deadline);
    project.setCreatedBy(owner);
    project.setMembers(new LinkedHashSet<>(java.util.List.of(members)));
    return projectRepository.save(project);
  }

  private void createTask(
      Project project,
      String title,
      String description,
      UserEntity assignee,
      UserEntity creator,
      TaskStatus status,
      TaskPriority priority,
      LocalDate dueDate
  ) {
    Task task = new Task();
    task.setProject(project);
    task.setTitle(title);
    task.setDescription(description);
    task.setAssignedTo(assignee);
    task.setCreatedBy(creator);
    task.setStatus(status);
    task.setPriority(priority);
    task.setDueDate(dueDate);
    taskRepository.save(task);
  }
}