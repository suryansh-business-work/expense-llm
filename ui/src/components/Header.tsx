import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { getBotPageByUrl } from '../pages/BotPagesData';

const Header = () => {
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();
  const botPage = getBotPageByUrl(botId || '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    console.log('Logging out...');
  };

  const navLinks = [
    { to: '/bots', label: 'All Bots' },
    { to: `/bot/${botId}/chat/chatbot/1`, label: 'Chat' },
    { to: `/bot/${botId}/chat/chatbot/2`, label: 'Dashboard' },
  ];

  // Determine whether to show Chat and Dashboard links
  const pathParts = location.pathname.split('/');
  const showChatAndDashboard =
    pathParts.length === 6 &&
    pathParts[1] === 'bot' &&
    pathParts[3] === 'chat';

  const drawer = (
    <Box onClick={toggleDrawer(false)} sx={{ width: 250 }}>
      <List>
        <ListItem
          key="/bots"
          component={NavLink}
          to="/bots"
          sx={{
            '&.active': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          <ListItemText primary="All Bots" />
        </ListItem>

        {showChatAndDashboard &&
          navLinks.slice(1).map((link) => (
            <ListItem
              key={link.to}
              component={NavLink}
              to={link.to}
              sx={{
                '&.active': {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#0c1b32' }}>
        <Toolbar>
          <Grid container alignItems="center" sx={{ alignItems: "center", width: '100%' }}>
            {isMobile && (
              <Grid size={{xs: 1, sm: 1, md: 1  }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              </Grid>
            )}
            <Grid size={{xs: 4, sm: 4, md: 4  }}>
              <div className="logo">
                <NavLink
                  to="/bots"
                  style={({ isActive }) => ({
                    color: 'inherit',
                    textDecoration: 'none',
                    marginRight: '1rem',
                    fontWeight: isActive ? 'bold' : 'normal',
                  })}
                >
                  <img src="/logo/botify-logo.svg" alt="Botify Your Life" />
                </NavLink>
              </div>
            </Grid>
            <Grid size={{xs: 6, sm: 6, md: 6 }} container alignItems="center">
              {botPage && (
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {botPage.botListPage.heading}
                </Typography>
              )}
              {!isMobile && showChatAndDashboard &&
                navLinks.slice(1).map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    style={({ isActive }) => ({
                      color: 'inherit',
                      textDecoration: 'none',
                      marginLeft: '1rem',
                      fontWeight: isActive ? 'bold' : 'normal',
                    })}
                  >
                    <Typography variant="body1">{link.label}</Typography>
                  </NavLink>
                ))}
            </Grid>
            <Grid size={{xs: 1, sm: 1, md: 2  }} sx={{ justifyItems: 'flex-end' }}>
              <Box>
                <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                  <Avatar alt="User" src="/user-avatar.jpg" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
