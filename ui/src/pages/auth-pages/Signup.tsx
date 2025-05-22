import { useState } from "react";
import { TextField, Button, Alert, CircularProgress, IconButton, InputAdornment, Link as MuiLink, Divider, Checkbox, FormControlLabel } from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link } from "react-router-dom";
import API_LIST from "../apiList";
import { GoogleLogin } from '@react-oauth/google';

// Joi validation schema
const schema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().label("First Name"),
  lastName: Joi.string().min(2).max(30).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  password: Joi.string().min(6).max(128).required().label("Password"),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match" }),
});

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(schema),
    mode: "onTouched",
  });

  const onSubmit = async (form: any) => {
    if (!acceptedTerms) {
      setErrorMsg("You must accept the Terms and Conditions to sign up.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(API_LIST.SIGNUP, { // <-- Use API_LIST here
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSuccessMsg("Signup successful! You can now sign in.");
        reset();
      } else {
        setErrorMsg(data.message || "Signup failed");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Handler for Google signup success
  const handleGoogleSignupSuccess = async (credentialResponse: any) => {
    try {
      // Send credentialResponse.credential to your backend for verification and signup/login
      const res = await fetch(API_LIST.GOOGLE_SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSuccessMsg("Signup successful! You can now sign in.");
        // Optionally, auto-login:
        // localStorage.setItem("token", data.data.token);
        // localStorage.setItem("user", JSON.stringify(data.data.user));
        // setUser(data.data.user);
        // navigate("/bots");
      } else {
        setErrorMsg(data.message || "Google signup failed");
      }
    } catch (err) {
      setErrorMsg("Google signup error. Please try again.");
    }
  };

  // Handler for Google signup error
  const handleGoogleSignupError = () => {
    setErrorMsg("Google signup was unsuccessful. Please try again.");
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="row" style={{ width: "100%" }}>
        <div className="col-7">
          <div className="signup-info">
              <img
              src="/signup-illustration.png"
              alt="Botify Your Life"
              width={400}
              style={{ marginBottom: 8 }}
            />
            <h2>Welcome to botify.life</h2>
            <p>Botify.life helps reduce daily life stress by allowing you to create your own custom bots tailored to your needs. Just like any other large language model, you can build personal tools that perform tasks for you—automating and simplifying your work.</p>
          </div>
        </div>
        <div className="col-5 text-center">
          <div className="logo-wrapper">
            <img
              src="/logo/botify-logo-dark.svg"
              alt="Botify Your Life"
              width={120}
              style={{ marginBottom: 8 }}
            />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className="row mb-3">
              <div className="col-12">
                <h2>Sign Up</h2>
              </div>
            </div>
            {errorMsg && (
              <div className="row pb-4">
                <div className="col-12">
                  <Alert severity="error">{errorMsg}</Alert>
                </div>
              </div>
            )}
            {successMsg && (
              <div className="row pb-4">
                <div className="col-12">
                  <Alert severity="success">{successMsg}</Alert>
                </div>
              </div>
            )}
            <div className="row">
              <div className="col-6 mb-3">
                <TextField
                  label="First Name"
                  {...register("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message as string}
                  fullWidth
                  disabled={loading}
                />
              </div>
              <div className="col-6 mb-3">
                <TextField
                  label="Last Name"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message as string}
                  fullWidth
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="col-12 mb-3">
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message as string}
                  fullWidth
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                          tabIndex={-1}
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message as string}
                  fullWidth
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                          onClick={() => setShowConfirm((show) => !show)}
                          edge="end"
                          tabIndex={-1}
                          disabled={loading}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="col-12 mb-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label={
                    <span>
                      I accept the{" "}
                      <MuiLink
                        href="/terms-and-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </MuiLink>
                    </span>
                  }
                />
              </div>
              <div className="col-12 mb-4">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign Up"}
                </Button>
              </div>
              <div className="col-12 mb-3">
                <Divider>or</Divider>
              </div>
              <div className="col-12 mb-3">
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={handleGoogleSignupError}
                  width="100%"
                  size="large"
                  shape="rectangular"
                  text="signup_with"
                  containerProps={{ style: { width: "100%" } }}
                />
              </div>
              <div className="col-12 mb-3">
                Already have an account?{" "}
                <MuiLink component={Link} to="/login">
                  Sign In
                </MuiLink>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div >
  );
}
