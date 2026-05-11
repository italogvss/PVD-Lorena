import { PaletteOptions } from '@mui/material/styles';

// ── Catavento Dark ────────────────────────────────────────────────────────────
// Deep cosmic purple backgrounds, hot-pink primary, electric cyan secondary.
// Like neon lights spinning on a carnival pinwheel at night.
export const cataventoDarkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    light:  '#FF6DBD',
    main:   '#FF2D9A',
    dark:   '#C4007A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    light:  '#6EFFFF',
    main:   '#00E5FF',
    dark:   '#00B2CC',
    contrastText: '#1B0333',
  },
  error:   { main: '#FF5252', contrastText: '#FFFFFF' },
  warning: { main: '#FFD740', contrastText: '#1B0333' },
  info:    { main: '#40C4FF', contrastText: '#1B0333' },
  success: { main: '#69F0AE', contrastText: '#1B0333' },
  background: {
    default: '#1B0333',   // deep cosmic violet
    paper:   '#2C0952',   // slightly lighter purple
  },
  text: {
    primary:   '#FFE8FC',   // barely-pink white — never pure black
    secondary: '#D4A0FF',   // soft lavender
    disabled:  '#8B6BAE',
  },
  divider: 'rgba(255, 45, 154, 0.22)',
  action: {
    hover:           'rgba(255, 45, 154, 0.12)',
    selected:        'rgba(255, 45, 154, 0.22)',
    hoverOpacity:    0.12,
    selectedOpacity: 0.22,
    focus:           'rgba(255, 45, 154, 0.16)',
    disabled:        'rgba(255, 232, 252, 0.30)',
    disabledBackground: 'rgba(255, 45, 154, 0.10)',
  },
};

// ── Catavento Light ───────────────────────────────────────────────────────────
// Warm rose-tinted backgrounds, deep magenta primary, rich violet secondary.
// Like a summer street festival in full daylight.
export const cataventoLightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    light:  '#F06292',
    main:   '#C2185B',   // deep magenta
    dark:   '#880E4F',
    contrastText: '#FFFFFF',
  },
  secondary: {
    light:  '#9162E4',
    main:   '#512DA8',   // rich violet
    dark:   '#280680',
    contrastText: '#FFFFFF',
  },
  error:   { main: '#E53935', contrastText: '#FFFFFF' },
  warning: { main: '#F57C00', contrastText: '#FFFFFF' },
  info:    { main: '#0288D1', contrastText: '#FFFFFF' },
  success: { main: '#2E7D32', contrastText: '#FFFFFF' },
  background: {
    default: '#FFF0FA',   // barely rose — not pure white
    paper:   '#FFFAFF',   // barely violet
  },
  text: {
    primary:   '#2D0542',   // deep purple instead of black
    secondary: '#7B1FA2',   // violet
    disabled:  '#BA68C8',
  },
  divider: 'rgba(194, 24, 91, 0.18)',
  action: {
    hover:           'rgba(194, 24, 91, 0.08)',
    selected:        'rgba(194, 24, 91, 0.16)',
    hoverOpacity:    0.08,
    selectedOpacity: 0.16,
    focus:           'rgba(194, 24, 91, 0.12)',
    disabled:        'rgba(45, 5, 66, 0.26)',
    disabledBackground: 'rgba(194, 24, 91, 0.08)',
  },
};
