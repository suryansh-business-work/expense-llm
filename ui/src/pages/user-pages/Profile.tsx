import { useEffect, useRef, useState } from "react";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Typography,
  Paper,
  Avatar,
  Tooltip,
  Fade,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

// Profile update schema
const profileSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().label("First Name"),
  lastName: Joi.string().min(2).max(30).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .label("Phone"),
});

// Password update schema
const passwordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required().label("Current Password"),
  newPassword: Joi.string().min(6).max(128).required().label("New Password"),
  confirmNewPassword: Joi.any()
    .valid(Joi.ref("newPassword"))
    .required()
    .label("Confirm New Password")
    .messages({ "any.only": "Passwords do not match" }),
});

export default function Profile() {
  // Unified state for profile fields and feedback
  const [profileState, setProfileState] = useState({
    loading: false,
    success: "",
    error: "",
    avatar: null as string | null,
    uploading: false,
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })(),
  });

  // Unified state for password fields and feedback
  const [passwordState, setPasswordState] = useState({
    loading: false,
    success: "",
    error: "",
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    watch: watchProfile,
  } = useForm({
    resolver: joiResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: profileState.user.firstName || "",
      lastName: profileState.user.lastName || "",
      email: profileState.user.email || "",
      phone: profileState.user.phone || "",
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: joiResolver(passwordSchema),
    mode: "onTouched",
  });

  // Avatar upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileState((prev) => ({ ...prev, uploading: true }));
      const reader = new FileReader();
      reader.onload = () => {
        setProfileState((prev) => ({
          ...prev,
          avatar: reader.result as string,
          uploading: false,
        }));
        // Optionally, upload to server here
      };
      reader.readAsDataURL(file);
    }
  };

  // Update profile handler
  const onSubmitProfile = async (form: any) => {
    setProfileState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      success: "",
    }));
    try {
      // Only send changed fields
      const changedFields: any = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== profileState.user[key]) changedFields[key] = form[key];
      });
      if (Object.keys(changedFields).length === 0) {
        setProfileState((prev) => ({
          ...prev,
          error: "No changes detected.",
          loading: false,
        }));
        return;
      }
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/auth/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changedFields),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setProfileState((prev) => ({
          ...prev,
          success: "Profile updated successfully.",
          user: data.data.user,
        }));
        // Update localStorage user
        localStorage.setItem("user", JSON.stringify(data.data.user));
        resetProfile(data.data.user);
      } else {
        setProfileState((prev) => ({
          ...prev,
          error: data.message || "Failed to update profile.",
        }));
      }
    } catch {
      setProfileState((prev) => ({
        ...prev,
        error: "Network error. Please try again.",
      }));
    }
    setProfileState((prev) => ({
      ...prev,
      loading: false,
    }));
  };

  // Update password handler
  const onSubmitPassword = async (form: any) => {
    setPasswordState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      success: "",
    }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/auth/update-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setPasswordState((prev) => ({
          ...prev,
          success: "Password updated successfully.",
        }));
        resetPassword();
      } else {
        setPasswordState((prev) => ({
          ...prev,
          error: data.message || "Failed to update password.",
        }));
      }
    } catch {
      setPasswordState((prev) => ({
        ...prev,
        error: "Network error. Please try again.",
      }));
    }
    setPasswordState((prev) => ({
      ...prev,
      loading: false,
    }));
  };

  // Sync form with localStorage user if changed
  useEffect(() => {
    resetProfile({
      firstName: profileState.user.firstName || "",
      lastName: profileState.user.lastName || "",
      email: profileState.user.email || "",
      phone: profileState.user.phone || "",
    });
    // eslint-disable-next-line
  }, [profileState.user]);

  // Watch for real-time updates
  const firstName = watchProfile("firstName");
  const lastName = watchProfile("lastName");
  const email = watchProfile("email");

  return (
    <div className="container" style={{ maxWidth: 800, marginTop: 48, marginBottom: 48 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Box sx={{ position: "relative", mr: 3 }}>
            <Tooltip title="Upload profile photo" arrow>
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  width: 80,
                  height: 80,
                  border: "3px solid #1976d2",
                  background: "#f5f7fa",
                  transition: "box-shadow 0.3s",
                  boxShadow: "0 4px 16px rgba(25, 118, 210, 0.08)",
                  "&:hover": { boxShadow: "0 8px 24px rgba(25, 118, 210, 0.18)" },
                }}
                aria-label="Upload profile photo"
              >
                <Fade in={!profileState.uploading}>
                  <Avatar
                    src={profileState.avatar || undefined}
                    sx={{
                      width: 72,
                      height: 72,
                      fontSize: 32,
                      bgcolor: "#e3f2fd",
                      color: "#1976d2",
                    }}
                  >
                    {!profileState.avatar && (firstName?.[0] || "U")}
                  </Avatar>
                </Fade>
                {profileState.uploading && (
                  <CircularProgress
                    size={48}
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      zIndex: 2,
                    }}
                  />
                )}
                <PhotoCamera
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    color: "#1976d2",
                    background: "#fff",
                    borderRadius: "50%",
                    p: 0.5,
                    fontSize: 24,
                  }}
                />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              aria-label="Choose profile photo"
            />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {(firstName || "") + (lastName ? " " + lastName : "") || "Profile"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#888" }}>
              {email || "Update your personal information and password."}
            </Typography>
          </Box>
        </Box>
        <form onSubmit={handleSubmitProfile(onSubmitProfile)} autoComplete="off">
          {profileState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileState.error}
            </Alert>
          )}
          {profileState.success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {profileState.success}
            </Alert>
          )}
          <div className="row">
            <div className="col-6 mb-3">
              <TextField
                label="First Name"
                {...registerProfile("firstName")}
                error={!!profileErrors.firstName}
                helperText={profileErrors.firstName?.message as string}
                fullWidth
                autoFocus
              />
            </div>
            <div className="col-6 mb-3">
              <TextField
                label="Last Name"
                {...registerProfile("lastName")}
                error={!!profileErrors.lastName}
                helperText={profileErrors.lastName?.message as string}
                fullWidth
              />
            </div>
            <div className="col-12 mb-3">
              <TextField
                label="Email"
                type="email"
                {...registerProfile("email")}
                error={!!profileErrors.email}
                helperText={profileErrors.email?.message as string}
                fullWidth
              />
            </div>
            <div className="col-12 mb-4">
              <TextField
                label="Phone"
                {...registerProfile("phone")}
                error={!!profileErrors.phone}
                helperText={profileErrors.phone?.message as string}
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </div>
            <div className="col-12">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={profileState.loading}
                sx={{ py: 1.5 }}
              >
                {profileState.loading ? <CircularProgress size={24} /> : "Update Profile"}
              </Button>
            </div>
          </div>
        </form>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} autoComplete="off">
          {passwordState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordState.error}
            </Alert>
          )}
          {passwordState.success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordState.success}
            </Alert>
          )}
          <div className="row">
            <div className="col-12 mb-3">
              <TextField
                label="Current Password"
                type={passwordState.showCurrent ? "text" : "password"}
                {...registerPassword("currentPassword")}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message as string}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={passwordState.showCurrent ? "Hide password" : "Show password"}
                        onClick={() =>
                          setPasswordState((prev) => ({
                            ...prev,
                            showCurrent: !prev.showCurrent,
                          }))
                        }
                        edge="end"
                        tabIndex={-1}
                      >
                        {passwordState.showCurrent ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12 mb-3">
              <TextField
                label="New Password"
                type={passwordState.showNew ? "text" : "password"}
                {...registerPassword("newPassword")}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message as string}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={passwordState.showNew ? "Hide password" : "Show password"}
                        onClick={() =>
                          setPasswordState((prev) => ({
                            ...prev,
                            showNew: !prev.showNew,
                          }))
                        }
                        edge="end"
                        tabIndex={-1}
                      >
                        {passwordState.showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12 mb-4">
              <TextField
                label="Confirm New Password"
                type={passwordState.showConfirm ? "text" : "password"}
                {...registerPassword("confirmNewPassword")}
                error={!!passwordErrors.confirmNewPassword}
                helperText={passwordErrors.confirmNewPassword?.message as string}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={passwordState.showConfirm ? "Hide password" : "Show password"}
                        onClick={() =>
                          setPasswordState((prev) => ({
                            ...prev,
                            showConfirm: !prev.showConfirm,
                          }))
                        }
                        edge="end"
                        tabIndex={-1}
                      >
                        {passwordState.showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={passwordState.loading}
                sx={{ py: 1.5 }}
              >
                {passwordState.loading ? <CircularProgress size={24} /> : "Update Password"}
              </Button>
            </div>
          </div>
        </form>
      </Paper>
    </div>
  );
}
