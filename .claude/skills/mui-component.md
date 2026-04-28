# Skill — Reusable MUI Component

Follow these rules for every shared component in `src/components/`.

---

## File Location

```
src/components/
├── layout/   ← AppBar, Sidebar, PageWrapper, BottomNav
└── ui/       ← DataTable, ConfirmDialog, LoadingButton, etc.
```

---

## Template

```tsx
import { FC } from 'react';
import Box from '@mui/material/Box';
// import other MUI components as needed

interface MyComponentProps {
  label: string;
  onClick?: () => void;
}

const MyComponent: FC<MyComponentProps> = ({ label, onClick }) => {
  return (
    <Box
      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
      onClick={onClick}
    >
      {label}
    </Box>
  );
};

export default MyComponent;
```

---

## Theme Rules — Non-Negotiable

**Never hardcode colors.** Always use MUI theme tokens:

```tsx
// ❌ Forbidden
sx={{ color: '#fff' }}
sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
style={{ color: 'white' }}

// ✅ Correct
sx={{ color: 'text.primary' }}
sx={{ color: 'text.secondary' }}
sx={{ bgcolor: 'background.paper' }}
sx={{ bgcolor: 'background.default' }}
color="error"
color="success"
```

When you need a palette value in logic (not `sx`), use `useTheme()`:

```tsx
import { useTheme } from '@mui/material/styles';

const theme = useTheme();
const color = theme.palette.primary.main;
```

---

## Dos and Don'ts

| Do | Don't |
|----|-------|
| Accept children or explicit props | Pass raw DOM elements as generic `any` |
| Use `FC<Props>` with a typed interface | Skip the interface and use inline types |
| Use MUI `sx` prop for style | Mix MUI and CSS modules |
| Use `color="..."` MUI shorthand when available | Use `style={{}}` attribute |
| Keep the component focused on one responsibility | Build multi-purpose mega-components |

---

## Checklist

- [ ] File is in `src/components/layout/` or `src/components/ui/`
- [ ] Props typed with an explicit TypeScript interface
- [ ] Zero hardcoded color values
- [ ] All styles via `sx` prop or MUI theme tokens
- [ ] Default export