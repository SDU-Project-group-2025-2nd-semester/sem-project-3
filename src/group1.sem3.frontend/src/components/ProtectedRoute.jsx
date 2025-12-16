import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles } = {}) {
  const { isHydrating, isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isHydrating) {
    // show a minimal loading state instead of rendering nothing
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center py-20">
        <div className="text-gray-600">Checking authentication�</div>
        <div className="flex justify-center py-10">
          <button
            className="px-4 py-2 bg-accent text-white rounded-lg"
            onClick={() => navigate("/")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // redirect to login, preserve intended destination
    return <Navigate to={"/"} replace state={{ from: location }} />;
  }

  if (roles && Array.isArray(roles) && roles.length > 0) {
    const userRole = currentUser?.role ?? 0;
    if (!roles.includes(userRole)) {
      // not authorized for this role
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
