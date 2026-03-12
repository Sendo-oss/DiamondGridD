import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import "./index.css";

import AppRouter from "./router";
import { AuthProvider } from "./app/auth";
import { CartProvider } from "./app/cart";
import { SplashScreen } from "./components/SplashScreen";
import { Chatbot } from "./components/Chatbot";

import { GoogleOAuthProvider } from "@react-oauth/google";

function AppWithSplash() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRouter />
            <Chatbot />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<AppWithSplash />);