import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Inventory from "./pages/Inventory";
import Navbar from "./components/Navbar";
import BillingHistoryPage from "./pages/InvoiceHistory";
import Invoice from "./pages/Invoice";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustoemrPage from "./pages/Customer";
import { ThemeProvider } from "./ThemeProvider";
import ModernOverview from "./components/invoice-templates/overview/modern-overview";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />

              <Route path="/invoice/:id" element={<ModernOverview />} />
            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/billing" element={<BillingHistoryPage />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/customer" element={<CustoemrPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
