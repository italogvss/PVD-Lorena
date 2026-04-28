# Backend — PDV.Api

For business rules, data model, and API contracts see `../docs/backend.md`.
For architecture decisions and global conventions see `../claude.md`.

---

## Prerequisites

- .NET 10 SDK (latest LTS)
- Docker + docker-compose (MySQL runs in a container)
- EF Core CLI tools:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## Running Locally

### 1. Start the database

From the repository root (`PDV-Lorena/`):

```bash
docker-compose up -d db
```

### 2. Set environment variables

Copy the root `.env.example` to `.env` and fill in the values (see `../docs/infra.md`).

### 3. Apply migrations

```bash
dotnet ef database update --project PDV.Infrastructure --startup-project PDV.Api
```

### 4. Run the API

```bash
cd backend/PDV.Api
dotnet run
```

API available at: `http://localhost:5000`
Swagger UI at: `http://localhost:5000/swagger`

---

## Useful Commands

```bash
# Add a new migration (always read .claude/skills/ef-entity.md first)
dotnet ef migrations add <MigrationName> \
  --project PDV.Infrastructure \
  --startup-project PDV.Api

# Revert last migration
dotnet ef migrations remove \
  --project PDV.Infrastructure \
  --startup-project PDV.Api

# List applied migrations
dotnet ef migrations list \
  --project PDV.Infrastructure \
  --startup-project PDV.Api

# Build the solution
dotnet build

# Run tests (when test project exists)
dotnet test
```

---

## Project Structure

```
backend/
├── PDV.Domain/          # Entities, enums, repository interfaces
├── PDV.Application/     # Use cases, DTOs, validators, service interfaces
├── PDV.Infrastructure/  # EF Core, repository implementations, external services
└── PDV.Api/             # Controllers, middlewares, Program.cs, Swagger
```

---

## Skill Reminder

Before creating any backend code, identify the task and read the corresponding skill:

| Task                              | Read                              |
|-----------------------------------|-----------------------------------|
| New endpoint or route             | `../.claude/skills/new-endpoint.md` |
| New entity or EF migration        | `../.claude/skills/ef-entity.md`    |