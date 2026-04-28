# Frontend — React + TypeScript + MUI

## Folder Structure

```
src/
├── assets/                  # static images and icons
├── components/              # shared reusable components
│   ├── layout/              # AppBar, Sidebar, PageWrapper, BottomNav
│   └── ui/                  # DataTable, ConfirmDialog, LoadingButton, etc.
├── contexts/
│   ├── AuthContext.tsx       # user, login(), logout(), isAdmin
│   └── ToastContext.tsx      # showToast(message, severity)
├── hooks/                   # useAuth, useToast, usePagination, useProduct, useSales etc.
├── lib/
│   └── axios.ts             # configured Axios instance
├── pages/                   # one folder per route
│   ├── Login/
│   ├── Dashboard/
│   ├── POS/                 # point of sale screen
│   ├── Sales/
│   ├── Products/
│   ├── Stock/
│   ├── Users/
│   └── Reports/
├── router/
│   ├── index.tsx            # route definitions
│   ├── PrivateRoute.tsx     # redirects to /login if unauthenticated
│   └── AdminRoute.tsx       # redirects to /dashboard if not Admin
├── services/                # API calls — one file per domain
│   ├── authService.ts
│   ├── productService.ts
│   ├── saleService.ts
│   ├── userService.ts
│   └── reportService.ts
├── theme/
│   └── theme.ts             # MUI dark theme — single source of truth
├── types/
│   └── index.ts             # all TypeScript interfaces and enums
├── utils/
│   ├── currency.ts          # formatBRL()
│   ├── date.ts              # formatDate(), formatDateTime()
│   └── pdf.ts               # generateReceiptPDF() using jsPDF
└── App.tsx
```

---

## MUI Theme — Absolute Rules

```typescript
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

 - Always use the MUI Theme to set the style
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#90caf9' },
    secondary:  { main: '#ce93d8' },
    error:      { main: '#f44336' },
    warning:    { main: '#ffa726' },
    success:    { main: '#66bb6a' },
    background: {
      default: '#121212',
      paper:   '#1e1e1e',
    },
  },
  shape: { borderRadius: 8 },
});

export default theme;
```

### Hardcoded colors are strictly forbidden anywhere in the project:

```typescript
// ❌ Never
sx={{ color: '#fff' }}
sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
style={{ color: 'white' }}

// ✅ Always
sx={{ color: 'text.primary' }}
sx={{ backgroundColor: 'background.paper' }}
color="text.secondary"
```

- Always consume colors via MUI tokens: `theme.palette.*`, `color="text.secondary"`, `bgcolor="background.paper"`.
- Use `useTheme()` whenever a palette value is needed in TypeScript logic.
- `ThemeProvider` wraps the entire application in `App.tsx`.
- Theme mode is fixed to `dark` — no toggle, no user preference.

---

## Routes

```
/login                  public
/                       → redirects to /dashboard if authenticated
/dashboard              authenticated
/pos                    authenticated — POS screen
/sales                  authenticated
/sales/:id              authenticated
/products               authenticated
/products/new           Admin only
/products/:id/edit      Admin only
/stock                  authenticated
/users                  Admin only
/users/new              Admin only
/reports                authenticated
```

- `<PrivateRoute>` — checks authentication; redirects to `/login` on 401.
- `<AdminRoute>` — checks `role === 'Admin'`; redirects to `/dashboard` for employees.

---

## Axios Instance

```typescript
// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends HttpOnly JWT cookie on every request
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

All `services/` files import this instance — never the global `axios`.

---

## AuthContext

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: { id: string; name: string; role: 'Admin' | 'Employee' } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}
```

- `user` is populated by calling `GET /api/auth/me` on app initialization.
- The frontend never reads or stores the JWT token — the cookie is managed entirely by the backend.

---

## Toast Notifications

```typescript
// Usage in any component
const { showToast } = useToast();
showToast('Sale completed successfully!', 'success');
showToast('Insufficient stock.', 'error');
```

- Implemented with MUI `Snackbar` + `Alert`.
- Default duration: 4000ms.
- Position: `bottom-center`.
- All API error responses must trigger a toast — never a raw `alert()` or `console.error`.

---

## Pagination

All lists use server-side pagination via query params:

```typescript
// Request
GET /api/products?page=1&pageSize=20

// Typed response
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

Use MUI `TablePagination` or `Pagination` component — no infinite scroll.

---

## Form Masks

Use `react-imask` for the following fields:

| Field   | Mask                  |
|---------|-----------------------|
| CPF     | `000.000.000-00`      |
| CNPJ    | `00.000.000/0000-00`  |
| Phone   | `(00) 00000-0000`     |
| ZIP     | `00000-000`           |

---

## Formatting Utilities

```typescript
// src/utils/currency.ts
export const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// src/utils/date.ts
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
```

---

## Receipt PDF (jsPDF)

```typescript
// src/utils/pdf.ts — called immediately after POST /api/sales succeeds
import jsPDF from 'jspdf';

export function generateReceiptPDF(sale: SaleDetail): void {
  // Required fields on SaleDetail:
  // id, createdAt, operatorName, customerName?,
  // items[]: { productName, quantity, unitPrice, subtotal }
  // total, paymentMethod, isInstallment, installmentCount?,
  // installmentValue?, amountPaid, change
  const doc = new jsPDF({ format: 'a5', orientation: 'portrait' });
  // ... build receipt layout
  doc.save(`receipt-${sale.id}.pdf`);
}
```

The PDF is triggered automatically in the browser after a successful sale — no backend endpoint needed.

---

## Charts (Chart.js)

Use `react-chartjs-2` as the React wrapper. Register only required components to keep bundle size small:

```typescript
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Tooltip, Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  Tooltip, Legend
);
```

Chart colors must always come from `theme.palette.*` — never hardcoded hex values.

---

## Responsiveness

- Layout is **mobile-first** — optimized for smartphones.
- Use MUI breakpoints: `xs` as base, `sm` for tablets when necessary.
- Main navigation via **bottom navigation bar** on mobile.
- Avoid horizontal tables on small screens — prefer cards or stacked lists.
- POS screen designed for one-handed use on mobile.
