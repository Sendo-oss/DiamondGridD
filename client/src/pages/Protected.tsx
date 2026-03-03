import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../app/auth";

export function Protected({
  roles,
  children,
}: {
  roles?: string[];
  children: React.ReactNode;
}) {
  const { user, token } = useAuth();
  const location = useLocation();

  // No logueado => manda a /login y recuerda a dónde quería ir
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logueado pero sin rol permitido => a home
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}