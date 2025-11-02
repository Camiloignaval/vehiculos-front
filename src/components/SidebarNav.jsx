import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/SpaceDashboardRounded";
import BuildCircleIcon from "@mui/icons-material/BuildCircleRounded";
import { useLocation, useNavigate } from "react-router-dom";

export default function SidebarNav({ mobileOpen, onClose, drawerWidth = 240 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/gestion", label: "Gestión", icon: <BuildCircleIcon /> },
  ];

  const content = (
    <>
      <Toolbar>
        <Box sx={{ fontWeight: 800, fontSize: 18 }}>Vehículos App</Box>
      </Toolbar>
      <List>
        {items.map((it) => (
          <ListItemButton
            key={it.to}
            selected={pathname.startsWith(it.to)}
            onClick={() => {
              navigate(it.to);
              if (!mdUp) onClose?.(); // cerrar en móvil
            }}
            sx={{ mx: 1, borderRadius: 2 }}
          >
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Drawer temporal en móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
          },
        }}
      >
        {content}
      </Drawer>

      {/* Drawer permanente en md+ */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
