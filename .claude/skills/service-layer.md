# Skill — Frontend Service File

One service file per domain in `src/services/`. Services are the only place that calls the API.

---

## File Location & Naming

```
src/services/
├── authService.ts
├── productService.ts
├── saleService.ts
├── userService.ts
└── reportService.ts
```

---

## Template

```typescript
import api from '../lib/axios';
import type { Product, PaginatedResponse } from '../types';

interface GetProductsParams {
  page: number;
  pageSize: number;
  name?: string;
  barcode?: string;
}

const productService = {
  getAll: (params: GetProductsParams) =>
    api.get<PaginatedResponse<Product>>('/api/products', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Product>(`/api/products/${id}`).then(r => r.data),

  create: (data: CreateProductRequest) =>
    api.post<Product>('/api/products', data).then(r => r.data),

  update: (id: string, data: UpdateProductRequest) =>
    api.put<Product>(`/api/products/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/api/products/${id}`),

  adjustStock: (id: string, quantity: number) =>
    api.patch(`/api/products/${id}/stock`, { quantity }),
};

export default productService;
```

---

## Rules

- **Always** import `api` from `../lib/axios` — never the global `axios`.
- Always type the response: `api.get<ResponseType>(...)`.
- Always call `.then(r => r.data)` to unwrap the Axios response before returning.
- Use `PaginatedResponse<T>` (from `src/types/index.ts`) for all list endpoints.
- **Do not** handle errors in service files — let them bubble up. The calling component handles errors via `showToast`.
- **Do not** add loading state here — that belongs in the component or a custom hook.
- Group all methods for a domain in a single `const serviceName = { ... }` object.

---

## Pagination pattern

```typescript
interface ListParams {
  page: number;
  pageSize: number;
}

getAll: (params: ListParams) =>
  api.get<PaginatedResponse<Sale>>('/api/sales', { params }).then(r => r.data),
```

Params are passed as query strings automatically by Axios via the `{ params }` option.

---

## Checklist

- [ ] File is in `src/services/` and named `<domain>Service.ts`
- [ ] Imports `api` from `../lib/axios`
- [ ] All methods are typed (request params + response type)
- [ ] `.then(r => r.data)` used to unwrap responses
- [ ] No error handling inside the service
- [ ] Default export is a single object