import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import AppRouter from "./router";
import { AuthProvider } from "./app/auth";
import { CartProvider } from "./app/cart";

import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);