# Skill — Frontend Domain Hook

Every service file must have a corresponding hook in `src/hooks/`. Hooks are the only place that manages `loading` state and calls service methods. Components never call services directly.

---

## File Location & Naming

```
src/
├── services/
│   └── productService.ts       ← calls the API (unchanged)
├── hooks/
│   ├── useProduct.ts
│   ├── useSale.ts
│   ├── useUser.ts
│   └── useReport.ts
└── pages/
    └── ProductPage.tsx         ← uses the hook, never the service directly
```

---

## Template

```typescript
// src/hooks/use<Domain>.ts
import { useState } from 'react';
import <domain>Service from '../services/<domain>Service';
import type { <Domain>, Create<Domain>Request, Update<Domain>Request, PaginatedResponse } from '../types';

type LoadingState = 'fetch' | 'fetchOne' | 'create' | 'update' | 'remove' | null;
// Add or remove values to match the domain's endpoints

export function use<Domain>() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getAll = async (params: <Domain>ListParams) => {
    setLoading('fetch');
    try {
      return await <domain>Service.getAll(params);
    } finally {
      setLoading(null);
    }
  };

  const getById = async (id: string) => {
    setLoading('fetchOne');
    try {
      return await <domain>Service.getById(id);
    } finally {
      setLoading(null);
    }
  };

  const create = async (data: Create<Domain>Request) => {
    setLoading('create');
    try {
      return await <domain>Service.create(data);
    } finally {
      setLoading(null);
    }
  };

  const update = async (id: string, data: Update<Domain>Request) => {
    setLoading('update');
    try {
      return await <domain>Service.update(id, data);
    } finally {
      setLoading(null);
    }
  };

  const remove = async (id: string) => {
    setLoading('remove');
    try {
      return await <domain>Service.remove(id);
    } finally {
      setLoading(null);
    }
  };

  return {
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
```

---

## Real example — useProduct

```typescript
// src/hooks/useProduct.ts
import { useState } from 'react';
import productService from '../services/productService';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../types';

type LoadingState = 'fetch' | 'fetchOne' | 'create' | 'update' | 'remove' | 'adjustStock' | null;

export function useProduct() {
  const [loading, setLoading] = useState<LoadingState>(null);

  const getAll = async (params: GetProductsParams) => {
    setLoading('fetch');
    try {
      return await productService.getAll(params);
    } finally {
      setLoading(null);
    }
  };

  const getById = async (id: string) => {
    setLoading('fetchOne');
    try {
      return await productService.getById(id);
    } finally {
      setLoading(null);
    }
  };

  const create = async (data: CreateProductRequest) => {
    setLoading('create');
    try {
      return await productService.create(data);
    } finally {
      setLoading(null);
    }
  };

  const update = async (id: string, data: UpdateProductRequest) => {
    setLoading('update');
    try {
      return await productService.update(id, data);
    } finally {
      setLoading(null);
    }
  };

  const remove = async (id: string) => {
    setLoading('remove');
    try {
      return await productService.remove(id);
    } finally {
      setLoading(null);
    }
  };

  const adjustStock = async (id: string, quantity: number) => {
    setLoading('adjustStock');
    try {
      return await productService.adjustStock(id, quantity);
    } finally {
      setLoading(null);
    }
  };

  return {
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
    adjustStock,
  };
}
```

---

## Usage in a component

```tsx
// src/pages/ProductPage.tsx
import { useProduct } from '../hooks/useProduct';

export function ProductPage() {
  const { loading, create, remove } = useProduct();

  const handleCreate = async () => {
    try {
      await create(formData);
      showToast('Product created!', 'success');
    } catch {
      showToast('Failed to create product.', 'error');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await remove(id);
      showToast('Product removed!', 'success');
    } catch {
      showToast('Failed to remove product.', 'error');
    }
  };

  return (
    <div>
      {/* Button with loading state for a specific action */}
      <button onClick={handleCreate} disabled={loading === 'create'}>
        {loading === 'create' ? <Spinner /> : 'Save'}
      </button>

      <button onClick={() => handleRemove(id)} disabled={loading === 'remove'}>
        {loading === 'remove' ? <Spinner /> : 'Delete'}
      </button>

      {/* List loading (skeleton or page-level spinner) */}
      {loading === 'fetch' && <TableSkeleton />}
    </div>
  );
}
```

---

## Rules

- **Always** create a hook for each service — never call the service directly from a component.
- `LoadingState` must have **one value per endpoint** in the corresponding service.
- Always use `finally` to ensure `loading` resets to `null` even when an error occurs.
- **Do not** handle errors inside the hook — let them bubble up naturally to the component.
- **Do not** store data (lists, objects) in the hook — that belongs in the component or a global state manager.
- The hook only manages `loading` and delegates calls to the service.

---

## LoadingState mapping by operation

| Operation     | LoadingState value | UI usage                     |
|---------------|--------------------|------------------------------|
| List          | `'fetch'`          | Table/list skeleton          |
| Fetch by ID   | `'fetchOne'`       | Inline or page-level spinner |
| Create        | `'create'`         | Spinner on the save button   |
| Update        | `'update'`         | Spinner on the edit button   |
| Remove        | `'remove'`         | Spinner on the delete button |
| Custom action | `'actionName'`     | Spinner on the action button |

---

## Checklist

- [ ] File is in `src/hooks/` and named `use<Domain>.ts` (camelCase, `use` prefix)
- [ ] Imports only the corresponding service — never `api` directly
- [ ] `LoadingState` is typed with all endpoints of the domain
- [ ] Every method uses `setLoading('action')` + `try/finally` + `setLoading(null)`
- [ ] No `catch` inside the hook — errors bubble up to the component
- [ ] No data state (`useState` for lists or objects) inside the hook
- [ ] Named export: `export function use<Domain>()`