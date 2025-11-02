import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import { ColorModeContext } from "../theme.js";
import { useNavigate, Outlet } from "react-router-dom";
import SidebarNav from "./SidebarNav.jsx";
import iconAzul from "../assets/brand/iconAzul.png";
import iconBlanco from "../assets/brand/iconBlanco.png";

const drawerWidth = 240;

export default function Layout() {
  const { mode, toggle } = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDrawerToggle = () => setMobileOpen((p) => !p);

  const navLogoSrc = mode === "dark" ? iconBlanco : iconAzul;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Hamburguesa sólo en móvil */}
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>

          {/* Logo mini */}
          <Box
            component="img"
            src={navLogoSrc}
            alt="Camilo y Diego Asociados"
            sx={{ height: 28, width: 80, objectFit: "contain" }}
          />

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

      {/* Drawer responsive */}
      <SidebarNav
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        drawerWidth={drawerWidth}
      />

      {/* Contenido: margen sólo en md+ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: 0, md: `${drawerWidth}px` },
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
