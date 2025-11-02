import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboardRounded";
import BuildCircleIcon from "@mui/icons-material/BuildCircleRounded";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function SidebarNav() {
  const { pathname } = useLocation();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { to: "/gestion", label: "Gestión", icon: <BuildCircleIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar>
        <Box sx={{ fontWeight: 800, fontSize: 16, ml: 0.5 }}>Menú</Box>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {items.map((it) => (
          <ListItemButton
            key={it.to}
            component={Link}
            to={it.to}
            selected={pathname.startsWith(it.to)}
            sx={{ mx: 0.5, mb: 0.5 }}
          >
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
