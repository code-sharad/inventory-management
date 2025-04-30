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

function App() {
  return (
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
  );
}

export default App;
