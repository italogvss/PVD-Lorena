# Skill — New Frontend Page (Route)

Follow these steps in order when adding a new page to the application.

---

## 1. Create the page folder and component

Each page gets its own folder under `src/pages/`:

```
src/pages/
└── Products/
    └── index.tsx        ← always index.tsx
```

### Page template

```tsx
import { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ProductsPage: FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Produtos
      </Typography>
      {/* page content */}
    </Box>
  );
};

export default ProductsPage;
```

---

## 2. Register the route — `src/router/index.tsx`

Wrap with `<PrivateRoute>` for authenticated users, or `<AdminRoute>` for Admin-only:

```tsx
import ProductsPage from '../pages/Products';

// Inside the router definition:
<Route
  path="/products"
  element={
    <PrivateRoute>
      <ProductsPage />
    </PrivateRoute>
  }
/>

// Admin-only example:
<Route
  path="/products/new"
  element={
    <AdminRoute>
      <ProductsNewPage />
    </AdminRoute>
  }
/>
```

---

## Route Table (existing routes — do not duplicate)

```
/login                  public
/                       → redirects to /dashboard
/dashboard              PrivateRoute
/pos                    PrivateRoute
/sales                  PrivateRoute
/sales/:id              PrivateRoute
/products               PrivateRoute
/products/new           AdminRoute
/products/:id/edit      AdminRoute
/stock                  PrivateRoute
/users                  AdminRoute
/users/new              AdminRoute
/reports                PrivateRoute
```

---

## 3. Common patterns inside a page

### Fetching data on mount

```tsx
import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import productService from '../../services/productService';
import type { Product } from '../../types';

const [products, setProducts] = useState<Product[]>([]);
const { showToast } = useToast();

useEffect(() => {
  productService.getAll({ page: 1, pageSize: 20 })
    .then(res => setProducts(res.data))
    .catch(() => showToast('Erro ao carregar produtos.', 'error'));
}, []);
```

### Showing a confirmation dialog before destructive actions

Use the shared `<ConfirmDialog>` from `src/components/ui/`.

---

## 4. Responsiveness

- Mobile-first: design for `xs`, add `sm`/`md` breakpoints only when needed.
- Avoid full-width horizontal tables on small screens — use cards or stacked lists.
- Navigation is handled by the global `BottomNav` component — do not add navigation inside pages.

---

## Checklist

- [ ] Folder created at `src/pages/<PageName>/index.tsx`
- [ ] Component name matches `<PageName>Page` convention
- [ ] Route registered in `src/router/index.tsx`
- [ ] Wrapped with `<PrivateRoute>` or `<AdminRoute>` as appropriate
- [ ] API errors trigger `showToast(...)` — no raw `alert()` or `console.error`
- [ ] No hardcoded colors