import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "../providers/UserProvider";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useUserContext();
  const token = localStorage.getItem("token");
  
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
}

export function UnprotectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useUserContext();
  const token = localStorage.getItem("token");

  if (token && user) return <Navigate to="/bots" replace />;
  return children;
}
