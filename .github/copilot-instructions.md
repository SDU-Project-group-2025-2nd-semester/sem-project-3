# GitHub Copilot Instructions - Desk Reservation System

## Architecture Overview

This is a full-stack desk reservation system with real-time IoT integration:
- **Backend**: ASP.NET Core 9.0 Web API with Entity Framework Core + PostgreSQL
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Real-time**: SignalR (DeskHub) for live desk updates + MQTT for IoT sensor integration
- **Infrastructure**: Docker Compose orchestrates backend, frontend, PostgreSQL, pgAdmin, MQTT broker (Mosquitto), and box-simulator (IoT desk emulator)

## Critical Development Workflows

### Running the Application

**Docker (recommended for full stack):**
```bash
docker compose up -d
# Backend: http://localhost:5002
# Swagger: http://localhost:5002/swagger
# pgAdmin: http://localhost:6050 (admin@admin.com / postgres)
```

**Backend standalone:**
```bash
cd src/Backend
dotnet ef database update
dotnet run
# HTTP: http://localhost:5290, HTTPS: https://localhost:7283
```

**Frontend standalone:**
```bash
cd src/group1.sem3.frontend
npm install
npm run dev
# Dev server: http://localhost:5173
```

**Tests:**
```bash
cd tests/Backend.Tests
dotnet test
```

### Database Management

- **Migrations**: Backend uses `DatabaseMigrationHostedService` which auto-runs migrations on startup
- **In development**: Database is **dropped and recreated** on every startup via `EnsureDeletedAsync()` + `EnsureCreatedAsync()` (see `DatabaseHostedService.cs`)
- **Seed data**: Automatically seeded in development mode (companies, rooms, desks, test users)
- **Manual migrations**: `dotnet ef migrations add <Name>` then restart app

## Project-Specific Conventions

### Authentication & Authorization

**Cookie-based authentication** (NOT JWT):
- Login via `/api/auth/login` sets a cookie (`IdentityConstants.ApplicationScheme`)
- Frontend **must** include `credentials: 'include'` in all fetch calls
- Custom `[RequireRole(UserRole.Admin)]` attribute on controllers (see `RoleAuthorizeAttribute.cs`)
- Roles: `User` (0), `Janitor` (1), `Admin` (2) — defined in `UserRole` enum

**Example frontend pattern:**
```jsx
const response = await fetch('/api/users', {
  method: 'GET',
  credentials: 'include',  // ← REQUIRED for auth cookies
  headers: { 'Content-Type': 'application/json' }
});
```

### Controller Patterns

**Service injection via primary constructors** (C# 12):
```csharp
public class UsersController(IUserService userService) : ControllerBase
{
    // 'userService' field is auto-generated
}
```

**Routing convention:**
- `[Route("api/[controller]")]` → `/api/Users` (controller name minus "Controller")
- `[HttpGet]` (no param) → `GET /api/Users`
- `[HttpGet("{userId}")]` → `GET /api/Users/{userId}`
- Method names don't affect routing—only HTTP verbs and route templates

### Frontend State Management

- **React Context** for auth (`AuthContext.jsx`) — NOT Redux yet
- **Hardcoded API base URL** in AuthContext: `https://s3-be-dev.michalvalko.eu/api` (update for local dev)
- **Role-based routing**: `/admin/*`, `/user/*`, `/janitor/*` based on `currentUser.role`

### Real-Time Communication

**SignalR DeskHub** (`src/Backend/Hubs/DeskHub.cs`):
- Subscribe to desk: `SubscribeToDesk(deskId)` → joins group `desk-{deskId}`
- Subscribe to room: `SubscribeToRoom(roomId)` → joins group `room-{roomId}`
- Server pushes desk height updates to subscribed clients

**MQTT Integration** (`MqttHostedService.cs`):
- Connects to Mosquitto broker at `mqtt:1883` (Docker internal network)
- Subscribes to `desks/#` topic for IoT sensor data
- `DeskControlService` sends commands to physical desks via MQTT

### Testing Patterns

**Testcontainers for integration tests**:
- `DatabaseFixture` spins up PostgreSQL container once per test collection
- `DatabaseCollection` attribute shares container across test classes
- Pattern: `public class MyTests(DatabaseFixture fixture) : IAsyncLifetime`

## Common Pitfalls & Solutions

### Frontend API Calls
- ❌ `fetch('/api/users')` without `credentials: 'include'` → 401 Unauthorized
- ❌ Mixing hardcoded base URLs with relative paths → use consistent approach
- ✅ Always use `credentials: 'include'` for authenticated endpoints

### Backend HTTPS in Docker
- ❌ Dev certificates don't work in containers → causes `Unable to configure HTTPS endpoint` error
- ✅ Set `ENV ASPNETCORE_URLS=http://+:8080` in Dockerfile to disable HTTPS
- ✅ Use reverse proxy (nginx/Caddy) for production HTTPS

### React Hooks
- ❌ Typo `userEffect` instead of `useEffect` → no auto-import
- ✅ Import: `import { useState, useEffect } from "react";`

### Entity Framework
- ❌ Adding enums to models without migration → runtime errors
- ✅ Add property, rebuild, restart (auto-migration runs in dev)

## Key Files Reference

- **Auth flow**: `src/Backend/Controllers/AuthController.cs` + `src/group1.sem3.frontend/src/context/AuthContext.jsx`
- **Role authorization**: `src/Backend/Data/RoleAuthorizeAttribute.cs`
- **Database context**: `src/Backend/Data/BackendContext.cs`
- **Service registration**: `src/Backend/Program.cs` (lines 49-58)
- **Docker setup**: `docker-compose.yml` (defines all services + volumes)
- **Seed data**: `src/Backend/Services/DatabaseHostedService.cs` (lines 40-518)
- **Real-time hub**: `src/Backend/Hubs/DeskHub.cs`
- **MQTT client**: `src/Backend/Services/MqttHostedService.cs`

## Deployment Environments

- **Production**: `s3-fe-main.michalvalko.eu` (FE), `s3-be-main.michalvalko.eu` (BE)
- **Integration**: `s3-fe-int.michalvalko.eu` (FE), `s3-be-int.michalvalko.eu` (BE)
- **Development**: `s3-fe-dev.michalvalko.eu` (FE), `s3-be-dev.michalvalko.eu` (BE)
- **CORS**: Configured for all three environments + `http://localhost:5173` (see `Program.cs` line 77)
