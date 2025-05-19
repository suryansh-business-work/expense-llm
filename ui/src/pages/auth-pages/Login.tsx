import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Alert, CircularProgress, IconButton, InputAdornment, Link as MuiLink } from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useUserContext } from "../../providers/UserProvider";
import API_LIST from "../apiList";

// Joi validation schema
const schema = Joi.object({
  identifier: Joi.string().required().label("Email or Phone"),
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

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 48 }}>
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
              label="Email or Phone"
              {...register("identifier")}
              error={!!errors.identifier}
              helperText={errors.identifier?.message as string}
              fullWidth
              autoFocus
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
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
    </div>
  );
}
