import { Navigate } from "react-router-dom";
import { isAdmin, isAuthenticated } from "../services/auth";

export default function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}