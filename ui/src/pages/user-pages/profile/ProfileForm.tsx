import { useEffect, useRef, useState } from "react";
import {
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
  Fade,
  Box,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useUserContext } from "../../../providers/UserProvider";
import { useDynamicSnackbar } from "../../../hooks/useDynamicSnackbar";
import API_LIST from "../../apiList";
import Button from "../../admin/design-system/components/Button";

// Profile schema
const profileSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().label("First Name"),
  lastName: Joi.string().min(2).max(30).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
});

export default function ProfileForm() {
  const { user, setUser } = useUserContext();
  const [profileState, setProfileState] = useState({
    loading: true, // set true for initial skeleton
    success: "",
    error: "",
    avatar: null as string | null,
    uploading: false,
    user: user,
  });

  // Dialog state for verification
  const [verifyDialog, setVerifyDialog] = useState<{
    open: boolean;
    type: "email" | null;
  }>({ open: false, type: null });

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const showSnackbar = useDynamicSnackbar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: joiResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: profileState.user.firstName || "",
      lastName: profileState.user.lastName || "",
      email: profileState.user.email || "",
    },
  });

  // Avatar upload handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Add this function to handle image upload to ImageKit
  const handleProfileImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch("http://localhost:3000/v1/api/imagekit/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.status === "success" && Array.isArray(data.data) && data.data[0]?.filePath?.fileUrl) {
      return data.data[0].filePath.fileUrl;
    } else {
      throw new Error(data.message || "Failed to upload image");
    }
  };

  // Update handleAvatarChange to upload and set profileImage
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileState((prev) => ({ ...prev, uploading: true }));
      try {
        const fileUrl = await handleProfileImageUpload(file);
        setProfileState((prev) => ({
          ...prev,
          avatar: fileUrl,
          uploading: false,
        }));
        // Optionally, update immediately in the backend:
        // await onSubmitProfile({ ...profileState.user, profileImage: fileUrl });
      } catch (err: any) {
        setProfileState((prev) => ({ ...prev, uploading: false }));
        showSnackbar(err.message || "Failed to upload image", "error");
      }
    }
  };

  // Profile update handler
  const onSubmitProfile = async (form: any) => {
    setProfileState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      success: "",
    }));
    try {
      const changedFields: any = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== profileState.user[key]) changedFields[key] = form[key];
      });
      // Only send profileImage if avatar is set and changed
      if (profileState.avatar && profileState.avatar !== profileState.user.profileImage) {
        changedFields.profileImage = profileState.avatar; // avatar is already the fileUrl
      }
      if (Object.keys(changedFields).length === 0) {
        setProfileState((prev) => ({
          ...prev,
          error: "No changes detected.",
          loading: false,
        }));
        showSnackbar("No changes detected.", "info");
        return;
      }
      const token = localStorage.getItem("token");
      const res = await fetch(API_LIST.UPDATE_PROFILE, {
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
        localStorage.setItem("user", JSON.stringify(data.data.user));
        reset(data.data.user);
        setUser(data.data.user); // update context with new user data
        showSnackbar("Profile updated successfully.", "success");
      } else {
        setProfileState((prev) => ({
          ...prev,
          error: data.message || "Failed to update profile.",
        }));
        showSnackbar(data.message || "Failed to update profile.", "error");
      }
    } catch {
      setProfileState((prev) => ({
        ...prev,
        error: "Network error. Please try again.",
      }));
      showSnackbar("Network error. Please try again.", "error");
    }
    setProfileState((prev) => ({
      ...prev,
      loading: false,
    }));
  };

  // Sync form with user if changed
  useEffect(() => {
    reset({
      firstName: profileState.user.firstName || "",
      lastName: profileState.user.lastName || "",
      email: profileState.user.email || "",
    });
    setProfileState((prev) => ({ ...prev, loading: false }));
    // eslint-disable-next-line
  }, [profileState.user]);

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const email = watch("email");

  // Verification dialog handlers
  const handleOpenVerifyDialog = (type: "email") => {
    setVerifyDialog({ open: true, type });
    setOtp("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSent(false);
    setResendTimer(0);
  };
  const handleCloseVerifyDialog = () => {
    setVerifyDialog({ open: false, type: null });
    setOtp("");
    setOtpError("");
    setOtpSuccess("");
    setOtpSent(false);
    setResendTimer(0);
  };

  // Send OTP API
  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_LIST.SEND_VERIFICATION_OTP, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setOtpSent(true);
        setOtpSuccess("OTP sent to your email.");
        setResendTimer(60);
        showSnackbar("OTP sent to your email.", "success");
      } else {
        setOtpError(data.message || "Failed to send OTP.");
        showSnackbar(data.message || "Failed to send OTP.", "error");
      }
    } catch {
      setOtpError("Network error. Please try again.");
      showSnackbar("Network error. Please try again.", "error");
    }
    setOtpLoading(false);
  };

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Verify OTP API
  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_LIST.VERIFY_USER_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setOtpSuccess("Email verified successfully!");
        showSnackbar("Email verified successfully!", "success");
        setUser({ ...user, isUserVerified: true });
        handleCloseVerifyDialog();
      } else {
        setOtpError(data.message || "Invalid OTP.");
        showSnackbar(data.message || "Invalid OTP.", "error");
      }
    } catch {
      setOtpError("Network error. Please try again.");
      showSnackbar("Network error. Please try again.", "error");
    }
    setOtpLoading(false);
  };

  return (
    <>
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
                  src={
                    profileState.avatar ||
                    profileState.user.profileImage || // <-- Use profileImage from user context
                    undefined
                  }
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
            {email || "Update your personal information."}
          </Typography>
        </Box>
      </Box>
      {profileState.loading ? (
        <Box>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmitProfile)} autoComplete="off">
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
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message as string}
                fullWidth
                autoFocus
              />
            </div>
            <div className="col-6 mb-3">
              <TextField
                label="Last Name"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message as string}
                fullWidth
              />
            </div>
            <div className="col-12 mb-3">
              <TextField
                label="Email"
                type="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message as string}
                fullWidth
                disabled // <-- Make email field disabled
              />
              {/* Email verification button if not verified */}
              {user && user.isUserVerified === false && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="medium"
                    onClick={() => {
                      handleOpenVerifyDialog("email");
                      handleSendOtp();
                    }}
                    disabled={otpLoading}
                  >
                    {otpLoading ? <CircularProgress size={18} /> : "Verify Email"}
                  </Button>
                </Box>
              )}
            </div>
            <div className="col-12">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={profileState.loading}
                loading={profileState.loading}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Verification Dialog */}
      <Dialog open={verifyDialog.open} onClose={handleCloseVerifyDialog}>
        <DialogTitle>
          Verify Email
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enter the OTP sent to your email address.
          </Typography>
          <TextField
            label="OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={otpLoading}
          />
          {otpError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {otpError}
            </Alert>
          )}
          {otpSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {otpSuccess}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleVerifyOtp}
            disabled={otpLoading || !otp}
            fullWidth
          >
            {otpLoading ? <CircularProgress size={20} /> : "Verify"}
          </Button>
          <Button
            variant="text"
            color="primary"
            onClick={handleSendOtp}
            disabled={otpLoading || resendTimer > 0}
            fullWidth
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerifyDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
