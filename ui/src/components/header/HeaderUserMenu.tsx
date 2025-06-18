import React, { useEffect, useState } from 'react';
import { Box, Avatar, Menu, Typography, Button, LinearProgress, Divider } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../providers/UserProvider';
import axios from "axios";

// Get first day of the current month as a Date object
function getFirstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

// Get end of the current month as an ISO string

function getEndOfMonth() {
  const d = new Date();
  // Set to first day of next month, then subtract 1 ms
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  end.setMilliseconds(-1);
  return end.toISOString();
}

const HeaderUserMenu = () => {
  const { user } = useUserContext();
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const avatarPic = user?.profileImage;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [totalPromptTokenSizeUsed, setTotalPromptTokenSizeUsed] = useState<number>(0);
  const [totalPromptTokenSizeAvailable, setTotalPromptTokenSizeAvailable] = useState<number>(0);
  const [totalPromptTokenSizeUsedPercentage, setTotalPromptTokenSizeUsedPercentage] = useState<number>(0);
  const [, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch usage summary only when menu is opened
  const fetchUsageSummary = async () => {
    const startDate = getFirstDayOfMonth();
    const endDate = getEndOfMonth();
    const botOwnerUserId = user?.userId || "";

    const apiUrl = `http://localhost:3000/v1/api/subscription-usage/user/${botOwnerUserId}/date-range?startDate=${startDate}&endDate=${endDate}`;

    try {
      const response = await axios.get(apiUrl);
      const { totalPromptTokenSize, userCurrentTokenCount } = response.data;
      setTotalPromptTokenSizeAvailable(userCurrentTokenCount?.tokenCount || 0)
      setTotalPromptTokenSizeUsed(totalPromptTokenSize || 0);
      setTotalPromptTokenSizeUsedPercentage(Math.min(((totalPromptTokenSize) / userCurrentTokenCount?.tokenCount) * 100, 100));
    } catch (err) {
      console.error("Failed to fetch usage summary:", err);
    }
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
    fetchUsageSummary();
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

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

  useEffect(() => {
    // Cleanup function to reset menu state on unmount
    return () => {
      setMenuOpen(false);
    };
  }, []);

  return (
    <div className="col-auto d-flex justify-content-end align-items-center">
      <Button onClick={handleAvatarClick} sx={{ p: 0 }}>
        {firstName && (
          <div className="d-flex align-items-center ps-2 pe-2">
            <span className="d-none d-md-inline-block me-3">{firstName} {lastName}</span>
            <Avatar alt={user?.firstName} src={avatarPic} />
          </div>
        )}

      </Button>
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
            Token used: {totalPromptTokenSizeUsed}/{totalPromptTokenSizeAvailable} (<b>{totalPromptTokenSizeUsedPercentage.toFixed(1)}% Used</b>)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={totalPromptTokenSizeUsedPercentage}
            sx={{ height: 8, borderRadius: 5, mb: 1 }}
            color={totalPromptTokenSizeUsedPercentage < 80 ? "primary" : "error"}
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
          <Button
            size="small"
            onClick={() => {
              handleCloseMenu();
              navigate("/organizations");
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
            fullWidth
          >
            Organizations
          </Button>
          <Button
            size="small"
            onClick={() => {
              handleCloseMenu();
              navigate("/manage-credentials");
            }}
            sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
            fullWidth
          >
            Manage Credentials
          </Button>
          {user?.role === "admin" && (
            <Button
              size="small"
              onClick={() => {
                handleCloseMenu();
                navigate("/admin/dashboard");
              }}
              sx={{ justifyContent: "flex-start", textTransform: "none", pl: 0 }}
              fullWidth
            >
              Admin
            </Button>
          )}
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
