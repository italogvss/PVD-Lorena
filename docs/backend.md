# Backend — Architecture, Data Model & API

## Clean Architecture — Layer Structure

```
backend/
├── PDV.Domain/          # Entities, enums, repository interfaces, pure business rules
├── PDV.Application/     # Use cases, DTOs, FluentValidation validators, service interfaces
├── PDV.Infrastructure/  # EF Core DbContext, repository implementations, external services
└── PDV.Api/             # Controllers, middlewares, DI registration, Program.cs, Swagger
```

### Dependency Rules

- `Domain` — no references to any other layer; no framework dependencies.
- `Application` — references `Domain` only.
- `Infrastructure` — references `Domain` and `Application`.
- `Api` — references `Application` and `Infrastructure` (only for DI registration).
- Controllers always receive and return **DTOs** — never domain entities directly.

---

## Data Model

### Conventions

- Primary key: `Guid Id` on all tables.
- Audit field: `CreatedAt DateTime (UTC)` on all tables.
- Soft delete **only on `Product`** via `IsActive bool` (default `true`).
  - All product queries must filter `IsActive = true` by default.
  - Reports and admin views may query all products including inactive ones.
- All other entities use **hard delete**.
- All dates stored in UTC.
- `SaleItem` stores snapshots of `ProductName` and `UnitPrice` at sale time to preserve history regardless of future product changes or deletion.

---

### User

```
Id            Guid         PK
Name          string
PasswordHash  string
Role          enum         Admin | Employee
CreatedAt     DateTime     UTC
```

---

### Product

```
Id          Guid          PK
Name        string
Barcode     string        nullable — unique if provided (EAN)
NCM         string        nullable — reserved for future eNotas integration
Price       decimal(10,2)
Stock       int           never negative — enforced in Application layer
IsActive    bool          soft delete — default true
CreatedAt   DateTime      UTC
```

---

### Sale

```
Id                Guid           PK
OperatorId        Guid           FK → User
CustomerName      string         nullable
PaymentMethod     string         "Cash" | "PIX" | "Credit Card" | "Debit Card"
IsInstallment     bool
InstallmentCount  int            nullable — required if IsInstallment = true, minimum 2
InstallmentValue  decimal(10,2)  nullable — Total / InstallmentCount
Total             decimal(10,2)  sum of all SaleItem subtotals
Status            enum           Active | Cancelled
CancelledById     Guid           nullable, FK → User
CancelledAt       DateTime       nullable, UTC
CreatedAt         DateTime       UTC
```

---

### SaleItem

```
Id            Guid           PK
SaleId        Guid           FK → Sale
ProductId     Guid           nullable, FK → Product (may have been deleted)
ProductName   string         snapshot of product name at sale time
UnitPrice     decimal(10,2)  snapshot of product price at sale time
Quantity      int
Subtotal      decimal(10,2)  UnitPrice * Quantity
```

> `ProductName` and `UnitPrice` are copied from the product at the moment of sale.
> Receipts and historical reports remain accurate even after product deletion or price changes.

---

## Business Rules

### Authentication

- JWT generated on login, stored in an `HttpOnly`, `SameSite=Strict`, `Secure` (production) cookie.
- Token claims: `sub` (UserId), `role`, `name`.
- Logout: endpoint that expires the cookie server-side.
- Protected routes: `[Authorize]`.
- Admin-only routes: `[Authorize(Roles = "Admin")]`.
- Frontend and backend share the same domain — cookie works with `SameSite=Strict`.

### Products

- Search by `Barcode` (exact match) or `Name` (partial, case-insensitive).
- Deletion sets `IsActive = false` (soft delete) — product disappears from listings and the POS screen.
- Stock adjustments are manual: a dedicated endpoint updates `Stock`.
- `Stock` must never go negative — validate in Application before persisting.

### Sales

Execute the following steps inside a **single database transaction**:

1. Validate all products are active (`IsActive = true`).
2. Validate all products have sufficient stock (`Stock >= Quantity`).
3. Decrement `Stock` for each product.
4. Save `Sale` with `SaleItem` snapshots (`ProductName`, `UnitPrice`).
5. If `IsInstallment = true`: require `InstallmentCount >= 2`, set `InstallmentValue = Total / InstallmentCount`.

If any item has insufficient stock → reject the entire sale with HTTP 422 and detail which product failed.

### Cancellations

- Admin only — no time restrictions.
- On cancellation:
  1. Set `Status` to `Cancelled`.
  2. Record `CancelledById` and `CancelledAt`.
  3. Return stock for each `SaleItem` to its product (only if product still exists and `IsActive = true`).
- Partial refunds do not exist — Admin cancels the full sale and recreates it with the correct items.

---

## API Endpoints

Base prefix: `/api`

### Auth

```
POST  /api/auth/login           { email, password } → sets JWT cookie
POST  /api/auth/logout          → expires the cookie
GET   /api/auth/me              → returns current authenticated user
```

### Users — Admin only

```
GET    /api/users                paginated list of employees
POST   /api/users                create employee
PUT    /api/users/{id}           update employee data
DELETE /api/users/{id}           hard delete
PUT    /api/users/{id}/password  admin resets an employee's password
```

### Products

```
GET    /api/products             paginated, filterable by name and barcode (active only)
GET    /api/products/{id}
POST   /api/products             Admin only
PUT    /api/products/{id}        Admin only
DELETE /api/products/{id}        Admin only — soft delete
PATCH  /api/products/{id}/stock  Admin only — { quantity: int } manual adjustment
```

### Sales

```
GET    /api/sales                paginated, filters: date range, operatorId, status
GET    /api/sales/{id}           full detail including items
POST   /api/sales                any authenticated user
DELETE /api/sales/{id}           Admin only — cancels the sale
```

### Reports

```
GET  /api/reports/sales               metrics (query: period=daily|weekly|monthly, startDate, endDate)
GET  /api/reports/sales/by-operator   sales grouped by employee
GET  /api/reports/stock               current stock snapshot (all products including inactive)
GET  /api/reports/sales/export        CSV export of sales in period
GET  /api/reports/stock/export        CSV export of current stock
```

---

## Pagination

All list endpoints accept and return:

```
Query params:  ?page=1&pageSize=20
```

```typescript
// Standard paginated response shape
{
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## Error Handling

Global exception middleware returns `ProblemDetails` (RFC 7807) for all unhandled exceptions:

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Insufficient stock",
  "status": 422,
  "detail": "Product 'Blue Pen' only has 2 units available."
}
```

| Domain exception        | HTTP status                              |
|-------------------------|------------------------------------------|
| `NotFoundException`     | 404                                      |
| `ValidationException`   | 400 + FluentValidation error list        |
| `BusinessException`     | 422                                      |
| `UnauthorizedException` | 401                                      |
| `ForbiddenException`    | 403                                      |
| Unmapped exception      | 500 — stack trace hidden in production   |

---

## eNotas / Invoice Module (Postponed)

- `NCM` field already exists on `Product` (nullable).
- Create an empty `IInvoiceService` interface in `PDV.Application` as a placeholder.
- No eNotas SDK or HTTP client should be added at this stage.
