import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithRedirect, getCurrentUser } from "aws-amplify/auth";
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await getCurrentUser();
      // User is already authenticated, redirect to dashboard
      navigate("/dashboard");
    } catch {
      // User is not authenticated, show login button
      setIsChecking(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithRedirect();
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Error signing in. Please try again.");
    }
  };

  if (isChecking) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="heading">TrackIt</h1>
          <p style={{ textAlign: "center" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="heading">TrackIt</h1>
        <button onClick={handleLogin} className="login-button">
          Login with AWS Cognito
        </button>
      </div>
    </div>
  );
}