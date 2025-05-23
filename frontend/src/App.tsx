import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Inventory from "./pages/Inventory";
import Navbar from "./components/Navbar";
import BillingHistoryPage from "./pages/InvoiceHistory";
import Invoice from "./pages/Invoice";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import CustomerPage from "./pages/Customer";
import { ThemeProvider } from "./ThemeProvider";
import ModernOverview from "./components/invoice-templates/overview/modern-overview";
import AdminAccess from "./pages/AdminAccess";
import { Toaster } from 'sonner'
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" enableSystem defaultTheme="system">
        <Toaster richColors closeButton />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/invoice/:id" element={<ModernOverview />} />

              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ResetPassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verify-email/:token"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <VerifyEmail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <VerifyEmail />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes with Navbar wrapper */}
              <Route
                element={
                  <ProtectedRoute>
                    <Navbar />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/billing" element={<BillingHistoryPage />} />
                <Route path="/invoice" element={<Invoice />} />
                <Route path="/customer" element={<CustomerPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAccess />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
