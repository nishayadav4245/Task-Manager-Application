# Nexus Project Management App

Nexus is a full-stack project and task management application with role-based access for Admin and Member users. The repository includes a React frontend and a Spring Boot backend supporting both **H2 (testing)** and **MySQL (production/workspace)** databases.

---

## 🚀 Features

* Authentication (Signup/Login with JWT)
* Role-based access control (Admin & Member)
* Project & Task management
* Dashboard analytics (Completed, In Progress, Overdue)
* Team management (Admin-controlled)
* Dual database support (H2 for testing, MySQL for persistent storage)

---

## 📁 Project Structure

```id="k4b6p1"
.
├── src/                         React frontend
│   ├── components/
│   ├── services/db.js           (temporary localStorage mock)
│   ├── App.jsx
│   └── main.jsx
├── backend/                     Spring Boot backend
│   ├── src/main/java/...
│   ├── src/main/resources/
│   │   ├── application.properties        (default config)
│   │   ├── application-h2.properties     (H2 testing DB)
│   │   └── application-mysql.properties  (MySQL DB)
│   ├── pom.xml
│   └── README.md
```

---

## ⚠️ Important Note

The frontend currently uses `localStorage` (`src/services/db.js`) for testing.

To connect with backend APIs:

```id="yq8c3l"
http://localhost:8080/api
```

---

## 💻 Frontend Setup

```id="fdc8b3"
npm install
npm run dev
```

Frontend runs at:

```id="h2b7p9"
http://localhost:5173
```

---

## ⚙️ Backend Setup

### Requirements

* Java 17
* Maven
* MySQL (optional for persistent DB)

---

## 🧪 Option 1: H2 Database (Testing)

Use this for quick testing (no setup required).

### Run with H2 profile:

```id="o3x9zq"
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### H2 Console:

```id="7rxgfa"
http://localhost:8080/h2-console
```

---

## 🗄️ Option 2: MySQL Database (Persistent)

### 1. Create database:

```id="h3e0fw"
CREATE DATABASE task_manager_db;
```

### 2. Configure `application-mysql.properties`:

```properties id="k7xt3d"
spring.datasource.url=jdbc:mysql://localhost:3306/task_manager_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### 3. Run with MySQL profile:

```id="3jxnvl"
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

## 🔐 Default Accounts

```id="7i9g2m"
Admin:  admin@nexus.com / password123
Member: member@nexus.com / password123
Member: designer@nexus.com / password123
```

---

## 🔌 API Overview

### Auth

```id="k1f1o3"
POST /api/auth/signup
POST /api/auth/login
```

### Projects

```id="gq7t3h"
GET /api/projects
POST /api/projects
PUT /api/projects/{id}
DELETE /api/projects/{id}
```

### Tasks

```id="o7k2xw"
GET /api/tasks
POST /api/tasks
PATCH /api/tasks/{id}/status
```

---

## 🔐 Authorization

```id="y9s8q1"
Authorization: Bearer <token>
```

---

## 🔄 Frontend → Backend Integration

Replace `src/services/db.js` with API calls:

```js id="m8w2zn"
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## ✅ Current Status

* Frontend working ✅
* Backend working ✅
* H2 (testing) configured ✅
* MySQL (persistent DB) configured ✅
* Frontend–backend integration done ✅

---

## 📌 Next Steps

* Replace localStorage with API calls
* Add refresh token handling
* Deploy backend + frontend
* Improve UI/UX

---
