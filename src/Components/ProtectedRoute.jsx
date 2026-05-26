import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, isLogin, role, requiredRole }) {
  if (!isLogin || role !== requiredRole) {
    return <Navigate to={requiredRole === "Staff" ? "/staff/login" : "/login"} />;
  }

  return children;
}
