import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Checking permissions…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.is_admin !== true) {
    return <Navigate to="/" replace />;
  }

  return children;
}
