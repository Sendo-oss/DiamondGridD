import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminDashboard } from "./pages/dash/AdminDashboard";
import { WorkerDashboard } from "./pages/dash/WorkerDashboard";
import { Protected } from "./pages/Protected";
import { ComponentPage } from "./pages/ComponentPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";

import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { OffersPage } from "./pages/OffersPage";
import { NewsPage } from "./pages/NewsPage";
import { CategoryPage } from "./pages/CategoryPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/components/:id" element={<ComponentPage />} />
      <Route path="/category/:type" element={<CategoryPage />} />

      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/news" element={<NewsPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <Protected roles={["admin"]}>
            <AdminDashboard />
          </Protected>
        }
      />
      <Route
        path="/worker"
        element={
          <Protected roles={["worker", "admin"]}>
            <WorkerDashboard />
          </Protected>
        }
      />

      <Route
        path="/profile"
        element={
          <Protected>
            <ProfilePage />
          </Protected>
        }
      />

      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}