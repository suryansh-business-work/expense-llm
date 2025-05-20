import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Card,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import API_LIST from "../apiList";

// Step 1: Email schema
const emailSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().label("Email"),
});

// Step 2: OTP & Password schema
const resetSchema = Joi.object({
  otp: Joi.string().min(4).max(8).required().label("OTP"),
  newPassword: Joi.string().min(6).max(128).required().label("New Password"),
  confirmPassword: Joi.any()
    .valid(Joi.ref("newPassword"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match" }),
});

const steps = ["Enter Email", "Verify OTP & Reset Password"];

export default function ForgotPassword() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  // Step 1: Email form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: joiResolver(emailSchema),
    mode: "onTouched",
  });

  // Step 2: OTP & Password form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm({
    resolver: joiResolver(resetSchema),
    mode: "onTouched",
  });

  // Step 1: Send OTP
  const onSubmitEmail = async (form: any) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(API_LIST.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSuccessMsg("OTP sent to your email.");
        setEmail(form.email);
        setTimeout(() => {
          setSuccessMsg("");
          setActiveStep(1);
        }, 1000);
      } else {
        setErrorMsg(data.message || "Failed to send OTP");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Step 2: Reset Password
  const onSubmitReset = async (form: any) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(API_LIST.RESET_PASSWORD, { // <-- Use API_LIST here
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: form.otp,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSuccessMsg("Password reset successful! Redirecting to login...");
        resetResetForm();
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to reset password");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 48 }}>
      <Card
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
          maxWidth: '900px',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          padding: 4,
        }}
        className="bot-card"
        tabIndex={0}
      >
        <div className="row mb-4">
          <div className="col-12 text-center">
            <img
              src="/logo/botify-logo-dark.svg"
              alt="Botify Your Life"
              width={120}
              style={{ marginBottom: 8 }}
            />
          </div>
        </div>
        <Box sx={{ width: "100%", mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {errorMsg && (
          <div className="row mb-2">
            <div className="col-12">
              <Alert severity="error">{errorMsg}</Alert>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="row mb-2">
            <div className="col-12">
              <Alert severity="success">{successMsg}</Alert>
            </div>
          </div>
        )}
        {activeStep === 0 && (
          <form onSubmit={handleSubmitEmail(onSubmitEmail)} autoComplete="off">
            <div className="row">
              <div className="col-12 mb-3">
                <TextField
                  label="Email"
                  type="email"
                  {...registerEmail("email")}
                  error={!!emailErrors.email}
                  helperText={emailErrors.email?.message as string}
                  fullWidth
                />
              </div>
              <div className="col-12">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Send OTP"}
                </Button>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 text-center">
                <span>
                  Remember your password?{" "}
                  <MuiLink component={Link} to="/login">
                    Sign In
                  </MuiLink>
                </span>
              </div>
            </div>
          </form>
        )}
        {activeStep === 1 && (
          <form onSubmit={handleSubmitReset(onSubmitReset)} autoComplete="off">
            <div className="row">
              <div className="col-12 mb-3">
                <TextField
                  label="OTP"
                  {...registerReset("otp")}
                  error={!!resetErrors.otp}
                  helperText={resetErrors.otp?.message as string}
                  fullWidth
                  autoFocus
                />
              </div>
              <div className="col-12 mb-3">
                <TextField
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  {...registerReset("newPassword")}
                  error={!!resetErrors.newPassword}
                  helperText={resetErrors.newPassword?.message as string}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowNewPassword((show) => !show)}
                          edge="end"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="col-12 mb-4">
                <TextField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  {...registerReset("confirmPassword")}
                  error={!!resetErrors.confirmPassword}
                  helperText={resetErrors.confirmPassword?.message as string}
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
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Reset Password"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
