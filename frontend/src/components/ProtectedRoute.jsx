import { Navigate, useLocation } from "react-router-dom";

/**
 * Central auth guard. Redirects to signin if not logged in.
 * If allowedRoles is set, redirects to role default route when user role is not allowed.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user || !user.id) {
    const redirect = location.pathname + location.search;
    return <Navigate to={`/signin?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/signin" replace />;
  }

  return children;
}
