import { PaletteOptions } from '@mui/material/styles';

const WHITE_1 = "#ffffff"
const WHITE_2 = "#e2e2e2"

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: { main: WHITE_1 },
  secondary: { light: '#9e8ad1ff', main: '#3e1d92', dark: '#2c1f4dff' },
  background: { default: 'rgb(26, 26, 26)', paper: 'rgb(24, 24, 24)' },
  action: {
    hover: '#0000001f',
    selected: '#0000001e',
    selectedOpacity: 0.16,
    hoverOpacity: 0.08,
  },
};

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: { main: 'rgb(37, 37, 37)', dark: 'rgb(0, 0, 0)'},
  secondary: { light: '#9e8ad1ff', main: '#3e1d92', dark: '#2c1f4dff' },
  background: { default: WHITE_1, paper: WHITE_2 },
  action: {
    hover: '#0000001f',
    selected: '#0000001e',
  },
};