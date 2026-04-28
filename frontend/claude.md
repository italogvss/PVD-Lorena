# Frontend — React App

For component conventions, theme rules, and routing see `../docs/frontend.md`.
For global conventions and access profiles see `../claude.md`.

---

## Prerequisites

- Node.js 20+ (LTS)
- npm or yarn

---

## Running Locally

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set environment variables

Create a `.env` file inside the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start the dev server

```bash
npm run dev
```

App available at: `http://localhost:3000`

---

## Useful Commands

```bash
# Development server with hot reload
npm run dev

# Type check without building
npm run tsc --noEmit

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── layout/
│   └── ui/
├── contexts/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── hooks/
├── lib/
│   └── axios.ts
├── pages/
├── router/
│   ├── index.tsx
│   ├── PrivateRoute.tsx
│   └── AdminRoute.tsx
├── services/
├── theme/
│   └── theme.ts
├── types/
│   └── index.ts
├── utils/
│   ├── currency.ts
│   ├── date.ts
│   └── pdf.ts
└── App.tsx
```

---

## Skill Reminder

Before creating any frontend code, identify the task and read the corresponding skill:

| Task                              | Read                                  |
|-----------------------------------|---------------------------------------|
| New reusable component            | `../.claude/skills/mui-component.md`  |
| New page (route)                  | `../.claude/skills/new-page.md`       |
| New service file                  | `../.claude/skills/service-layer.md`  |