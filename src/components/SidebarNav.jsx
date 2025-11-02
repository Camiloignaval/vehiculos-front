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
          borderRight: "none",
        },
      }}
    >
      <Toolbar>
        <Box sx={{ fontWeight: 800, fontSize: 18 }}>Vehículos App</Box>
      </Toolbar>
      <List>
        {items.map((it) => (
          <ListItemButton
            key={it.to}
            component={Link}
            to={it.to}
            selected={pathname.startsWith(it.to)}
            sx={{ mx: 1, borderRadius: 2 }}
          >
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText primary={it.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
