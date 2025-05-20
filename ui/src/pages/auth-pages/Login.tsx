import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Alert, CircularProgress, IconButton, InputAdornment, Link as MuiLink, Divider, Card } from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useUserContext } from "../../providers/UserProvider";
import API_LIST from "../apiList";
import { GoogleLogin } from '@react-oauth/google';

// Joi validation schema
const schema = Joi.object({
  identifier: Joi.string().email({ tlds: false }).required().label("Email"),
  password: Joi.string().min(6).max(128).required().label("Password"),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserContext();

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
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(API_LIST.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        // Store token and user in localStorage separately
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setUser(data.data.user); // Set user context for real-time updates across app
        reset();
        navigate("/bots"); // Redirect to projected routes page after login
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Handler for Google login success
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      // Send credentialResponse.credential to your backend for verification and login/signup
      const res = await fetch(API_LIST.GOOGLE_SIGNIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setUser(data.data.user);
        reset();
        navigate("/bots");
      } else {
        setErrorMsg(data.message || "Google login failed");
      }
    } catch (err) {
      setErrorMsg("Google login error. Please try again.");
    }
  };

  // Handler for Google login error
  const handleGoogleLoginError = () => {
    setErrorMsg("Google login was unsuccessful. Please try again.");
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
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="row mb-3">
            <div className="col-12">
              <h2>Sign In</h2>
            </div>
          </div>
          {errorMsg && (
            <div className="row mb-2">
              <div className="col-12">
                <Alert severity="error">{errorMsg}</Alert>
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-12 mb-3">
              <TextField
                label="Email"
                {...register("identifier")}
                error={!!errors.identifier}
                helperText={errors.identifier?.message as string}
                fullWidth
                disabled={loading}
                type="email"
              />
            </div>
            <div className="col-12 mb-4">
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
            <div className="col-12 mb-3">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : "Sign In"}
              </Button>
            </div>
            <div className="col-12 mb-3">
              <Divider>or</Divider>
            </div>
            <div className="col-12 mb-3">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                width="100%"
                size="large"
                shape="rectangular"
                text="signin_with"
                containerProps={{ style: { width: "100%" } }}
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12 text-center">
              <span>
                Don&apos;t have an account?{" "}
                <MuiLink component={Link} to="/signup">
                  Sign Up
                </MuiLink>
              </span>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 text-center">
              <MuiLink component={Link} to="/forgot-password">
                Forgot password?
              </MuiLink>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
