import { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography,
  Divider,
  Box,
  Skeleton,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDynamicSnackbar } from "../../../hooks/useDynamicSnackbar";
import API_LIST from "../../apiList"; // <-- Add this import at the top

const passwordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required().label("Current Password"),
  newPassword: Joi.string().min(6).max(128).required().label("New Password"),
  confirmNewPassword: Joi.any()
    .valid(Joi.ref("newPassword"))
    .required()
    .label("Confirm New Password")
    .messages({ "any.only": "Passwords do not match" }),
});

export default function ProfilePasswordSection() {
  const [passwordState, setPasswordState] = useState({
    loading: false,
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });

  const showSnackbar = useDynamicSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(passwordSchema),
    mode: "onTouched",
  });

  // Simulate loading skeleton on mount (for demo, remove if not needed)
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  useState(() => {
    const timer = setTimeout(() => setSkeletonLoading(false), 700);
    return () => clearTimeout(timer);
  });

  const onSubmitPassword = async (form: any) => {
    setPasswordState((prev) => ({
      ...prev,
      loading: true,
    }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_LIST.UPDATE_PASSWORD, { // <-- Use API_LIST here
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmNewPassword: form.confirmNewPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        showSnackbar("Password updated successfully.", "success");
        reset();
      } else {
        showSnackbar(data.message || "Failed to update password.", "error");
      }
    } catch {
      showSnackbar("Network error. Please try again.", "error");
    }
    setPasswordState((prev) => ({
      ...prev,
      loading: false,
    }));
  };

  return (
    <>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        Change Password
      </Typography>
      {skeletonLoading ? (
        <Box>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmitPassword)} autoComplete="off">
          <div className="row">
            <div className="col-12 mb-3">
              <TextField
                label="Current Password"
                type={passwordState.showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message as string}
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
                {...register("newPassword")}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message as string}
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
                {...register("confirmNewPassword")}
                error={!!errors.confirmNewPassword}
                helperText={errors.confirmNewPassword?.message as string}
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
      )}
    </>
  );
}