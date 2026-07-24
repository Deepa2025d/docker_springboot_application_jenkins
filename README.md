# TaskFlow — Modern Task Management

A clean, aesthetic, fully responsive task management web app built with **Spring Boot** on the backend and **vanilla HTML/CSS/JS** on the frontend (no frontend framework or build step required).

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Glassmorphism UI** with animated gradient blobs in the background
- **Light / Dark mode** toggle (persisted, respects your last choice)
- **Live dashboard** — total / pending / in-progress / completed counters with animated count-up
- **Priority breakdown donut chart** (Chart.js) + overall completion progress bar
- **Full CRUD** — create, edit, delete tasks via a slide-in modal
- **One-click complete toggle**, priority badges, due dates
- **Search + filter tabs** (All / Pending / In Progress / Completed)
- **Toast notifications** for every action
- **Fully responsive** — works from 320px mobile up to wide desktop
- REST API backed by Spring Data JPA + H2 in-memory database (seeded with demo data)
- `/actuator/health` endpoint ready for Kubernetes liveness/readiness probes
- Multi-stage `Dockerfile` included, ready for the CI/CD pipeline

## 🗂 Project Structure

```
taskflow/
├── pom.xml
├── Dockerfile
├── src/main/java/com/taskflow/
│   ├── TaskFlowApplication.java
│   ├── model/Task.java
│   ├── repository/TaskRepository.java
│   └── controller/TaskController.java
├── src/main/resources/
│   ├── application.properties
│   ├── data.sql                  # demo seed data
│   └── static/
│       ├── index.html
│       ├── css/style.css
│       └── js/app.js
```

## 📦 Building the runnable jar

Requires **Java 21** and **Maven** installed on your machine.

**Linux/Mac:**
```bash
./build.sh
```

**Windows:**
```bash
build.bat
```

This produces `target/taskflow.jar`. Run it with:
```bash
java -jar target/taskflow.jar
```

Or manually, without the script:
```bash
mvn clean package -DskipTests
java -jar target/taskflow.jar
```

## 🚀 Running locally (without building a jar first)

```bash
mvn spring-boot:run
```

App will be available at **http://localhost:8080**
H2 console (for inspecting the demo DB): **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:taskflowdb`, user `sa`, no password)

## 🐳 Run with Docker

```bash
docker build -t taskflow:latest .
docker run -p 8080:8080 taskflow:latest
```

## ☸️ Deploying to Kubernetes

This project is designed to drop straight into the Jenkins + Kubernetes pipeline covered earlier:

1. Push this repo to GitHub/GitLab
2. Jenkins Pipeline 1 builds the jar, builds the Docker image, pushes to your registry
3. Jenkins Pipeline 2 applies your `k8s/deployment.yaml` + `k8s/service.yaml` and rolls out the new image
4. The `/actuator/health` endpoint is already wired for `readinessProbe` / `livenessProbe`

Just update the image name in your deployment manifest to match wherever you push this image.

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/{id}` | Get a single task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| PATCH | `/api/tasks/{id}/status` | Update only the status (`{"status":"COMPLETED"}`) |
| DELETE | `/api/tasks/{id}` | Delete a task |
| GET | `/api/tasks/stats` | Aggregated counts (total, by status, by priority) |

### Example: create a task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship v2","description":"Release the new dashboard","priority":"HIGH","status":"PENDING","dueDate":"2026-08-01"}'
```

## 🎨 Customizing the look

All colors, gradients, radii, and shadows are defined as CSS variables at the top of `css/style.css` (`:root` and `[data-theme="dark"]`). Change the `--accent` / `--gradient` values to instantly re-theme the whole app.

## License

MIT — use it, fork it, ship it.
