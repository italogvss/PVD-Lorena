import { TypographyVariantsOptions } from "@mui/material/styles";

export const typography: TypographyVariantsOptions = {
  fontFamily: "var(--font-creato), sans-serif",
  fontSize: 14,

  h1: {
    fontWeight: 800,
    letterSpacing: "0.06em",
  },

  h2: {
    fontWeight: 700,
    letterSpacing: "0.05em",
  },

  h3: {
    fontWeight: 600,
    letterSpacing: "0.04em",
  },

  h4: {
    fontWeight: 600,
    letterSpacing: "0.03em",
  },

  h5: {
    fontWeight: 500,
    letterSpacing: "0.01em",
  },

  h6: {
    fontWeight: 400,
    fontSize: "0.95rem",
    opacity: 0.65,
    letterSpacing: "0.05em",
  },

  subtitle1: {
    fontWeight: 400,
    letterSpacing: "0.04em",
    lineHeight: 1.3
  },

  body1: {
    fontSize: "1rem",
    fontWeight: 300,
    letterSpacing: "0.03em",
    lineHeight: 0.6
  },

  body2: {
    fontSize: "0.95rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
  },

  caption: {
    fontSize: "0.8rem",
    letterSpacing: "0.03em",
    opacity: 0.7,
  },

  button: {
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
};
