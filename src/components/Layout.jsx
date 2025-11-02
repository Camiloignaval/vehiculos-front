// src/components/Layout.jsx
import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Typography,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import SidebarNav from "./SidebarNav.jsx";
import { ColorModeContext } from "../theme.js";
import { useNavigate, Outlet } from "react-router-dom";

const drawerWidth = 240;

export default function Layout() {
  const { mode, toggle } = useContext(ColorModeContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 👇 cambia logo según tema
  const navLogoSrc =
    mode === "dark" ? "/images/iconBlanco.png" : "/images/iconAzul.png";

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* --- LOGO MINI A LA IZQUIERDA --- */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src={navLogoSrc}
              alt="Camilo y Diego Asociados"
              sx={{
                height: 50, // tamaño mini
                width: 70,
                // objectFit: "contain",
                // display: "block",
              }}
            />
          </Box>
          {/* -------------------------------- */}

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={mode === "light" ? "Modo oscuro" : "Modo claro"}>
            <IconButton color="inherit" onClick={toggle}>
              {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={logout} sx={{ ml: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ ml: 2, width: 28, height: 28 }}>V</Avatar>
        </Toolbar>
      </AppBar>

      <SidebarNav />

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px`, minHeight: "100vh" }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
