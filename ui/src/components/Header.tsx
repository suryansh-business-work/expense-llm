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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink, useParams } from 'react-router-dom';
import { getBotPageByUrl } from '../pages/BotPagesData';

const Header = () => {
  const { botId } = useParams<{ botId: string }>();
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
    // Replace this with your actual logout logic
    console.log('Logging out...');
  };

  const navLinks = [
    { to: '/bots', label: 'All Bots' },
    { to: '/chat/1', label: 'Chat' },
    { to: '/dashboard/1', label: 'Dashboard' },
  ];

  const drawer = (
    <Box onClick={toggleDrawer(false)} sx={{ width: 250 }}>
      <List>
        {navLinks.map((link) => (
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
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* "All Bots" always visible */}
          <NavLink
            to="/bots"
            style={({ isActive }) => ({
              color: 'inherit',
              textDecoration: 'none',
              marginRight: '1rem',
              fontWeight: isActive ? 'bold' : 'normal',
            })}
          >
            <Typography variant="h6">All Bots</Typography>
          </NavLink>

          {/* Show bot heading only on desktop */}
          {botPage && !isMobile && (
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
              {botPage.botListPage.heading}
            </Typography>
          )}

          {/* Desktop nav links */}
          {!isMobile &&
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

          {/* Avatar with Menu */}
          <Box sx={{ marginLeft: 'auto' }}>
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
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
