import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, AppBar, CssBaseline } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PaletteIcon from "@mui/icons-material/Palette";
import { Outlet, useLocation, Link } from "react-router-dom";
import Header from "../../components/header/Header";

const drawerWidth = 300;

const navItems = [
  { text: "Admin Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { text: "All Users", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "Theme Management", icon: <PaletteIcon />, path: "/admin/theme-management" },
  { text: "Docker Management", icon: <PaletteIcon />, path: "/admin/docker-management" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: "#1976d2" }}>
        <Header />
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f4f6fa", p: 3, minHeight: "100vh" }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
