# Infra — Docker, Environment Variables & Deploy

## Repository Structure

```
/
├── backend/
│   ├── src/
│   │   ├── PDV.Domain/
│   │   ├── PDV.Application/
│   │   ├── PDV.Infrastructure/
│   │   └── PDV.Api/
│   ├── Dockerfile
│   └── PDV.sln
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── .claude/
│   └── skills/
├── docs/
│   ├── backend.md
│   ├── frontend.md
│   └── infra.md
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env                    # never commit — add to .gitignore
├── .env.example            # commit this — template with placeholder values
└── claude.md
```

---

## Docker Compose — Development

```yaml
# docker-compose.yml
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Development
    env_file:
      - .env
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    env_file:
      - .env

  db:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Frontend and API are served under the **same domain** in production via nginx reverse proxy, ensuring the JWT cookie works correctly with `SameSite=Strict`.

---

## Environment Variables

### Backend — `.env` (development) / system variables (production)

```env
# Database
DB_CONNECTION_STRING=Server=db;Port=3306;Database=pdv;User=root;Password=your_password_here
DB_ROOT_PASSWORD=your_root_password_here
DB_NAME=pdv

# JWT
JWT_SECRET=a_long_random_string_minimum_32_characters
JWT_EXPIRES_HOURS=8

# CORS — exact frontend origin
FRONTEND_URL=http://localhost:3000

# Environment
ASPNETCORE_ENVIRONMENT=Development
```

In production: `ASPNETCORE_ENVIRONMENT=Production` — stack traces are never exposed in responses.

### Frontend — `.env` (development)

```env
VITE_API_URL=http://localhost:5000
```

In production, this variable is set in the VPS environment or passed as a build argument in the Dockerfile.

---

## CORS Configuration

Configured in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(builder.Configuration["FRONTEND_URL"]!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()); // required for HttpOnly JWT cookie
});

app.UseCors("Frontend");
```

- Only the frontend origin is allowed.
- `AllowCredentials()` is required for the JWT cookie to be sent cross-origin.
- No rate limiting at this stage.

---

## HTTPS

- Development: plain HTTP on localhost.
- Production: HTTPS enforced via nginx with Let's Encrypt certificate.
- `app.UseHttpsRedirection()` active only in production environment.

---

## MySQL MCP (Development Only)

The MySQL MCP server is configured in `.claude/mcp_settings.json` to allow Claude Code to inspect the schema, verify migrations, and run queries during development.

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASS": "your_password_here",
        "MYSQL_DB": "pdv"
      }
    }
  }
}
```

> **Never** configure this with production credentials.

---

## Production Deploy (Manual — VPS)

1. SSH into the VPS and clone the repository.
2. Set all environment variables on the system (not via `.env` file).
3. Build and start services:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```
4. Apply EF migrations on first deploy (or after schema changes):
   ```bash
   docker exec pdv-api dotnet ef database update
   ```
5. nginx acts as reverse proxy:
   - `yourdomain.com` → frontend (port 3000)
   - `yourdomain.com/api` → backend (port 5000)

No automated CI/CD pipeline at this stage — all deploys are manual.
