import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Amplify } from "aws-amplify";

import "./index.css";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import TransactionsInsertPage from "./TransactionsInsertPage.jsx";

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      region: "us-east-1",
      userPoolId: "us-east-1_2yBuCQD59",
      userPoolClientId: "1ral22edgd2jnc9lm3dh6l9l51",
      loginWith: {
        oauth: {
          domain: "us-east-12ybucqd59.auth.us-east-1.amazoncognito.com",
          scopes: ["email", "openid", "profile"],
          redirectSignIn: ["http://localhost:5173/dashboard"],
          redirectSignOut: ["http://localhost:5173/"],
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
        <Route path="/transactions" element={<TransactionsInsertPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  </StrictMode>
);