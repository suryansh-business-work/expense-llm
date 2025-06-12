import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, Box, Drawer, IconButton, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, Toolbar, 
  Typography, useMediaQuery, useTheme, Divider, Tooltip,
  Badge, Chip
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  ViewList as ContainersIcon, Add as AddIcon,
  Terminal as TerminalIcon, CloudOff as CloudOffIcon,
  Cloud as CloudIcon, Code as CodeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkDockerStatus } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const drawerWidth = 240;

interface MainLayoutProps {
  colorMode: {
    toggleColorMode: () => void;
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({ colorMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDockerConnected, setIsDockerConnected] = useState(false);
  
  useEffect(() => {
    const checkDocker = async () => {
      const status = await checkDockerStatus();
      setIsDockerConnected(status);
    };
    
    checkDocker();
    const interval = setInterval(checkDocker, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const navigateTo = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Containers', icon: <ContainersIcon />, path: '/containers' },
    { text: 'Create Container', icon: <AddIcon />, path: '/create' }
  ];
  
  const drawer = (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CodeIcon sx={{ fontSize: 30, mr: 1 }} />
            <Typography variant="h6" component="div">
              Docker Manager
            </Typography>
          </Box>
        </motion.div>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 5 }}
            >
              <ListItem disablePadding>
                <ListItemButton 
                  selected={isActive}
                  onClick={() => navigateTo(item.path)}
                  sx={{
                    borderRight: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
                    bgcolor: isActive 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(88, 166, 255, 0.08)'
                        : 'rgba(41, 98, 255, 0.08)'
                      : 'transparent'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? theme.palette.text.primary : theme.palette.text.secondary
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </motion.div>
          );
        })}
      </List>
      
      <Divider sx={{ mt: 2, mb: 2 }} />
      
      <Box sx={{ px: 2 }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Chip
            icon={isDockerConnected ? <CloudIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
            label={isDockerConnected ? "Docker Connected" : "Docker Disconnected"}
            color={isDockerConnected ? "success" : "error"}
            variant="outlined"
            size="small"
            sx={{ width: '100%' }}
          />
        </motion.div>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {location.pathname === '/' && 'Dashboard'}
                {location.pathname === '/containers' && 'Containers'}
                {location.pathname.startsWith('/terminal/') && 'Terminal'}
                {location.pathname === '/create' && 'Create Container'}
              </motion.div>
            </AnimatePresence>
          </Typography>
          
          <ThemeToggle toggleColorMode={colorMode.toggleColorMode} />
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="menu"
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default MainLayout;