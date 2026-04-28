# PDV — Point of Sale System

Web-based point of sale application for inventory management, sales processing, cancellations, employee profiles, and sales analytics. Future integration with the eNotas API for invoice generation is planned but **not part of the current scope**.

---

## Project Documentation

Before any task, identify the context and read the relevant doc:

| Task context                                        | Read                  |
|-----------------------------------------------------|-----------------------|
| Backend, API, database, business rules              | `docs/backend.md`     |
| Frontend, React components, routing, MUI theme      | `docs/frontend.md`    |
| Docker, environment variables, deploy, CORS         | `docs/infra.md`       |

Each sub-project also has its own `claude.md` with setup and run instructions:

- Backend commands, migrations, project structure → `backend/claude.md`
- Frontend commands, Vite config, project structure → `frontend/claude.md`

---

## Skills — Read Before Coding

Before writing any code, identify the task type and read the corresponding skill:

| Task type                                        | Read                              |
|--------------------------------------------------|-----------------------------------|
| Create an API endpoint or route                  | `.claude/skills/new-endpoint.md`  |
| Create a domain entity or EF migration           | `.claude/skills/ef-entity.md`     |
| Create a reusable React component                | `.claude/skills/mui-component.md` |
| Create a frontend page (route)                   | `.claude/skills/new-page.md`      |
| Create a frontend service file (`*Service.ts`)   | `.claude/skills/service-layer.md` |
| Use this skill whenever a new service file is created or referenced, and a domain hook needs to be created or updated in `src/hooks/`.   | `.claude/skills/hook-layer.md` |

---

## Tech Stack

| Layer    | Technologies                                                                      |
|----------|-----------------------------------------------------------------------------------|
| Frontend | React, TypeScript, MUI (fixed dark theme), React Router v6, Axios, Chart.js, jsPDF |
| Backend  | C# .NET (latest LTS), Entity Framework Core + Pomelo (MySQL), FluentValidation, Swagger |
| Database | MySQL 8                                                                           |
| Infra    | Docker, docker-compose, VPS, nginx reverse proxy                                  |

---

## Access Profiles

| Role        | Permissions                                                                        |
|-------------|------------------------------------------------------------------------------------|
| Admin       | Full access — including cancel sales, manage products, manage users, view reports  |
| Employee    | Create sales, view inventory and products, view own sales                          |

- The first Admin user is inserted manually via database seed or migration.
- Employees are created by Admin through the application.
- Password recovery is manual — Admin resets via a protected endpoint.

---

## Global Conventions

- Language: all UI text, error messages, and logs in **pt-BR** (Brazilian Portuguese).
- Dates: stored as **UTC** in the database; displayed as `dd/MM/yyyy HH:mm` in the frontend.
- Currency: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- Primary keys: `Guid` on all entities.
- Audit fields: `CreatedAt DateTime (UTC)` on all tables.
- Soft delete: **only on `Product`** via `IsActive bool` (default `true`). All other entities use hard delete.
- Snapshots: `SaleItem` stores `ProductName` and `UnitPrice` at the time of sale to preserve history.

---

## Git

- Atomic commits — one commit per feature or fix.
- Commit message format: `type(scope): short description in English`
  - Examples: `feat(products): add stock adjustment endpoint`
  - Types: `feat` | `fix` | `refactor` | `chore` | `docs`
- Never commit `.env` files or secrets.
- Create a branch for new features: `feature/feature-name`.
- Create a branch for fixes: `fix/fix-name`.

---

## MySQL (MCP)

- Use the MySQL MCP to inspect the schema before creating migrations.
- After running a migration, confirm the table/column was created correctly.
- Never run destructive queries (`DROP`, `DELETE` without `WHERE`) without explicit confirmation.
- The MCP connects to the **development** database only — never production credentials here.
- MCP config lives in `.claude/mcp_settings.json` — this file is in `.gitignore` and must never be committed.

---

## Do NOT Implement Now

- eNotas integration / NF-e or NFC-e invoice emission (`NCM` field exists on `Product`; `IInvoiceService` interface reserved empty in Application)
- Password recovery via email or SMS
- Multi-location inventory
- Employee commissions
- Promotions or discount coupons
- Low stock notifications
- Automated CI/CD pipeline