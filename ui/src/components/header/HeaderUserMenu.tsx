import React, { useState } from 'react';
import { Box, IconButton, Avatar, Menu, Typography, Button, LinearProgress, Divider } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../providers/UserProvider';

const HeaderUserMenu = () => {
  const { user } = useUserContext();
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const profilePic = user?.profilePic || '/user-avatar.jpg';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const currentMessageCount = 100;
  const maxMessageCount = 500;
  const messagePercent = Math.min((currentMessageCount / maxMessageCount) * 100, 100);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    handleCloseMenu();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    handleCloseMenu();
    navigate("/profile");
  };

  const handleManageSubscription = () => {
    handleCloseMenu();
    navigate("/manage-subcription");
  };

  return (
    <div className="col-auto d-flex justify-content-end align-items-center">
      {firstName && (
        <Typography sx={{ color: '#fff', mr: 1 }}>
          {firstName} {lastName}
        </Typography>
      )}
      <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
        <Avatar alt="User" src={profilePic} />
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
        sx={{ minWidth: 240 }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1, minWidth: 240 }}>
          {fullName && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {fullName}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Messages used: {currentMessageCount}/{maxMessageCount}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={messagePercent}
            sx={{ height: 8, borderRadius: 5, mb: 1 }}
            color={messagePercent < 80 ? "primary" : "error"}
          />
          <Button size="small" onClick={handleManageSubscription}>Manage Subscription</Button>
        </Box>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Button
            size="small"
            component="a"
            href="https://yourdomain.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
            fullWidth
          >
            Data Protection Policy
          </Button>
          <Button
            size="small"
            component="a"
            href="https://yourdomain.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
            fullWidth
          >
            Privacy Policy
          </Button>
          <Button
            size="small"
            onClick={() => {
              handleCloseMenu();
              navigate("/integrations");
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
            fullWidth
          >
            Integrations
          </Button>
          <Button
            size="small"
            onClick={() => {
              handleCloseMenu();
              navigate("/settings");
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
            fullWidth
          >
            Settings
          </Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: 1, py: 0.5 }}>
          <Button size="small" onClick={handleProfile}>Profile</Button>
          <Button size="small" color="error" onClick={handleLogout}>Logout</Button>
        </Box>
      </Menu>
    </div>
  );
};

export default HeaderUserMenu;
