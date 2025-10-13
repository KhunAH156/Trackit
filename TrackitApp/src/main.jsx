import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Amplify } from "aws-amplify";

import "./index.css";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import TransactionsInsertPage from "./TransactionsInsertPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { SessionManager } from "./components/SessionManager.jsx";

Amplify.configure({
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION,
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [import.meta.env.VITE_REDIRECT_SIGN_IN],
          redirectSignOut: [import.meta.env.VITE_REDIRECT_SIGN_OUT],
          responseType: "code",
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <SessionManager>
                <TransactionsInsertPage />
              </SessionManager>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <SessionManager>
                <Dashboard />
              </SessionManager>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  </StrictMode>
);