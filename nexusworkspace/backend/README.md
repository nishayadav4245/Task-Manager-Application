# Nexus Project Management Backend

Spring Boot REST API for authentication, project management, team management, task assignment, task progress tracking, and role-based access control.

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Security
- Spring Data JPA
- Bean Validation
- H2 SQL database

## Run Locally

From the `backend` folder:

```bash
mvn spring-boot:run
```

API base URL:

```txt
http://localhost:8080/api
```

H2 database console:

```txt
http://localhost:8080/h2-console
```

H2 JDBC URL:

```txt
jdbc:h2:file:./data/nexus-db
```

Username/password:

```txt
sa / password
```

## Seed Accounts

```txt
Admin:  admin@nexus.com  / password123
Member: member@nexus.com / password123
Member: designer@nexus.com / password123
```

## Auth Flow

Login returns a bearer token. Send it on protected requests:

```txt
Authorization: Bearer <token>
```

## Endpoints

### Auth

```txt
POST /api/auth/signup
POST /api/auth/login
```

Signup/login body examples:

```json
{
  "name": "Nisha Yadav",
  "email": "nisha@example.com",
  "password": "password123",
  "role": "MEMBER"
}
```

```json
{
  "email": "admin@nexus.com",
  "password": "password123"
}
```

### Users

```txt
GET  /api/users
POST /api/users    Admin only
```

### Projects

```txt
GET    /api/projects
GET    /api/projects/{id}
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
```

Project body:

```json
{
  "name": "Mobile App Launch",
  "description": "Build the initial MVP release.",
  "client": "Internal",
  "deadline": "2026-08-30",
  "memberIds": [1, 2]
}
```

### Tasks

```txt
GET    /api/tasks
GET    /api/tasks?projectId=1
POST   /api/tasks
PUT    /api/tasks/{id}
PATCH  /api/tasks/{id}/status
DELETE /api/tasks/{id}
```

Task body:

```json
{
  "projectId": 1,
  "title": "Create database schema",
  "description": "Add normalized tables and relationships.",
  "assignedToId": 2,
  "priority": "HIGH",
  "dueDate": "2026-06-10"
}
```

Status update body:

```json
{
  "status": "IN_PROGRESS"
}
```

Allowed statuses:

```txt
BACKLOG, IN_PROGRESS, REVIEW, DONE
```

Allowed priorities:

```txt
LOW, MEDIUM, HIGH
```

## Role Rules

Admin:

- Can view and manage all projects.
- Can assign team members to projects.
- Can create, edit, delete, and update all tasks.
- Can onboard users.

Member:

- Can create projects owned by themselves.
- Can update projects they own.
- Can see projects they own or belong to.
- Can create self-assigned tasks in accessible projects.
- Can update progress only for tasks assigned to them.
- Can edit/delete tasks they created.

## Database Relationships

```txt
users
projects.created_by_id -> users.id
project_members.project_id -> projects.id
project_members.user_id -> users.id
tasks.project_id -> projects.id
tasks.assigned_to_id -> users.id
tasks.created_by_id -> users.id
```