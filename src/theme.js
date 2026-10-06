"use client";

import { createTheme } from "@mui/material/styles";

// Tema claro alinhado à referência: acento verde (emerald) e cinzas slate.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#059669" },
    success: { main: "#059669" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    background: { default: "#fafafa", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "#e2e8f0",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
});

export default theme;
