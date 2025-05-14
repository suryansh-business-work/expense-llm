import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
  // Profile state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Get user from localStorage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

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
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
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

  // Update profile handler
  const onSubmitProfile = async (form: any) => {
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      // Only send changed fields
      const changedFields: any = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== user[key]) changedFields[key] = form[key];
      });
      if (Object.keys(changedFields).length === 0) {
        setProfileError("No changes detected.");
        setProfileLoading(false);
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
        setProfileSuccess("Profile updated successfully.");
        // Update localStorage user
        localStorage.setItem("user", JSON.stringify(data.data.user));
        resetProfile(data.data.user);
      } else {
        setProfileError(data.message || "Failed to update profile.");
      }
    } catch {
      setProfileError("Network error. Please try again.");
    }
    setProfileLoading(false);
  };

  // Update password handler
  const onSubmitPassword = async (form: any) => {
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
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
        setPasswordSuccess("Password updated successfully.");
        resetPassword();
      } else {
        setPasswordError(data.message || "Failed to update password.");
      }
    } catch {
      setPasswordError("Network error. Please try again.");
    }
    setPasswordLoading(false);
  };

  // Sync form with localStorage user if changed
  useEffect(() => {
    resetProfile({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    // eslint-disable-next-line
  }, [localStorage.getItem("user")]);

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 48 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Profile
        </Typography>
        <form onSubmit={handleSubmitProfile(onSubmitProfile)} autoComplete="off">
          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {profileSuccess}
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
                disabled={profileLoading}
                sx={{ py: 1.5 }}
              >
                {profileLoading ? <CircularProgress size={24} /> : "Update Profile"}
              </Button>
            </div>
          </div>
        </form>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <form onSubmit={handleSubmitPassword(onSubmitPassword)} autoComplete="off">
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}
          <div className="row">
            <div className="col-12 mb-3">
              <TextField
                label="Current Password"
                type={showCurrent ? "text" : "password"}
                {...registerPassword("currentPassword")}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message as string}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showCurrent ? "Hide password" : "Show password"}
                        onClick={() => setShowCurrent((show) => !show)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showCurrent ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12 mb-3">
              <TextField
                label="New Password"
                type={showNew ? "text" : "password"}
                {...registerPassword("newPassword")}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message as string}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showNew ? "Hide password" : "Show password"}
                        onClick={() => setShowNew((show) => !show)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12 mb-4">
              <TextField
                label="Confirm New Password"
                type={showConfirm ? "text" : "password"}
                {...registerPassword("confirmNewPassword")}
                error={!!passwordErrors.confirmNewPassword}
                helperText={passwordErrors.confirmNewPassword?.message as string}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirm((show) => !show)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
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
                disabled={passwordLoading}
                sx={{ py: 1.5 }}
              >
                {passwordLoading ? <CircularProgress size={24} /> : "Update Password"}
              </Button>
            </div>
          </div>
        </form>
      </Paper>
    </div>
  );
}
