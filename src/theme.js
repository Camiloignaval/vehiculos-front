// src/theme.js
import { createTheme } from "@mui/material/styles";
import { createContext, useMemo, useState, useEffect } from "react";

// Colores que pediste
const PALETTE = {
  dark: {
    background: { default: "#1A1A1A", paper: "#0F1417" },
    text: { primary: "#F0F0F0", secondary: "rgba(240,240,240,.7)" },
    primary: { main: "#004D61" },   // acento 1
    secondary: { main: "#822659" }, // acento 2
    success: { main: "#3E5641" },   // CTA
  },
  light: {
    background: { default: "#F7F7F7", paper: "#FFFFFF" },
    text: { primary: "#1A1A1A", secondary: "rgba(26,26,26,.7)" },
    primary: { main: "#004D61" },
    secondary: { main: "#822659" },
    success: { main: "#3E5641" },
  },
};

export const ColorModeContext = createContext({
  mode: "dark",
  toggle: () => { },
});

export function useColorMode() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("theme-mode") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
    // opcional: clase para CSS globals
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const toggle = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark" ? PALETTE.dark : PALETTE.light),
        },
        shape: { borderRadius: 12 },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                // que el AppBar cambie con el tema
                backgroundColor:
                  mode === "dark"
                    ? PALETTE.dark.background.paper
                    : PALETTE.light.background.paper,
                color:
                  mode === "dark"
                    ? PALETTE.dark.text.primary
                    : PALETTE.light.text.primary,
                borderBottom:
                  mode === "dark"
                    ? "1px solid rgba(255,255,255,.06)"
                    : "1px solid rgba(0,0,0,.06)",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor:
                  mode === "dark"
                    ? PALETTE.dark.background.paper
                    : PALETTE.light.background.paper,
                color:
                  mode === "dark"
                    ? PALETTE.dark.text.primary
                    : PALETTE.light.text.primary,
                borderRight:
                  mode === "dark"
                    ? "1px solid rgba(255,255,255,.06)"
                    : "1px solid rgba(0,0,0,.06)",
              },
            },
          },
        },
      }),
    [mode]
  );

  const ctx = useMemo(() => ({ mode, toggle }), [mode]);

  return { theme, ctx };
}
