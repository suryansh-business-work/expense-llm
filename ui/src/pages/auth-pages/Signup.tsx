import { useState } from "react";
import { TextField, Button, Alert, CircularProgress, IconButton, InputAdornment, Link as MuiLink } from "@mui/material";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link } from "react-router-dom";

// Joi validation schema
const schema = Joi.object({
  firstName: Joi.string().min(2).max(30).required().label("First Name"),
  lastName: Joi.string().min(2).max(30).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .label("Phone"),
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
    setSuccessMsg("");
    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
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
            <h2>Sign Up</h2>
          </div>
        </div>
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
            />
          </div>
          <div className="col-12 mb-3">
            <TextField
              label="Phone"
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message as string}
              fullWidth
              inputProps={{ maxLength: 10 }}
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
          <div className="col-12 mb-4">
            <TextField
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message as string}
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
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 text-center">
            <span>
              Already have an account?{" "}
              <MuiLink component={Link} to="/login">
                Sign In
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
