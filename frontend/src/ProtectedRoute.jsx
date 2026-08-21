import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  // User is not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // User is logged in
  return children;
}

export default ProtectedRoute;