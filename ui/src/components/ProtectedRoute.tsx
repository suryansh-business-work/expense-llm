import { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsValid(false);
      setLoading(false);
      return;
    }
    fetch("http://localhost:3000/auth/user-info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.status === "success") setIsValid(true);
        else setIsValid(false);
      })
      .catch(() => setIsValid(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Backdrop open sx={{ color: "#fff", zIndex: 2000 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}

export function UnprotectedRoute({ children }: { children: JSX.Element }) {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setChecking(false);
  }, []);

  if (checking)
    return (
      <Backdrop open sx={{ color: "#fff", zIndex: 2000 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  if (isLoggedIn) return <Navigate to="/bots" replace />;
  return children;
}
