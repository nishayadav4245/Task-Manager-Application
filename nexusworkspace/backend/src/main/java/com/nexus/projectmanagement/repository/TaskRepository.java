package com.nexus.projectmanagement.repository;

import com.nexus.projectmanagement.domain.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByProjectId(Long projectId);

  @Query("""
      select distinct t from Task t
      join t.project p
      left join p.members m
      where t.assignedTo.id = :userId
         or t.createdBy.id = :userId
         or p.createdBy.id = :userId
         or m.id = :userId
      """)
  List<Task> findVisibleToMember(@Param("userId") Long userId);

  long countByProjectId(Long projectId);

  long countByProjectIdAndStatus(Long projectId, com.nexus.projectmanagement.domain.TaskStatus status);
}