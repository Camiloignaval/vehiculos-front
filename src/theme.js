import { createTheme } from "@mui/material/styles";
import { createContext, useMemo, useState, useEffect } from "react";

export const ColorModeContext = createContext({
  mode: "light",
  toggle: () => {},
});

export function useColorMode() {
  const [mode, setMode] = useState(
    () => localStorage.getItem("mode") || "light"
  );

  useEffect(() => {
    localStorage.setItem("mode", mode);
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "light" ? "#16a34a" : "#22c55e" },
          background: {
            default: mode === "light" ? "#f6f8fa" : "#0b0f14",
            paper: mode === "light" ? "#ffffff" : "#0f1720",
          },
        },
        shape: { borderRadius: 14 },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow:
                  mode === "light"
                    ? "0 8px 24px rgba(0,0,0,.06)"
                    : "0 8px 24px rgba(0,0,0,.35)",
              },
            },
          },
        },
      }),
    [mode]
  );

  const ctx = useMemo(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "light" ? "dark" : "light")),
    }),
    [mode]
  );
  return { theme, ctx };
}
