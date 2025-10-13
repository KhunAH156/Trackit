import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "aws-amplify/auth";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  }

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;