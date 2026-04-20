import { useAuth } from "@/lib/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminGuard() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff-login" replace />;
  }

  return <Outlet />;
}