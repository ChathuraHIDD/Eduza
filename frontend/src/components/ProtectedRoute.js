import { Navigate } from "react-router-dom";
import { getAuthToken, getStoredUser } from "../utils/api";

// login/register
export default function ProtectedRoute({ children, roles = [] }) {
  const token = getAuthToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}