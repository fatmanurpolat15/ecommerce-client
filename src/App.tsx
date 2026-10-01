import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Products from "./pages/Products";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Navbar />

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;