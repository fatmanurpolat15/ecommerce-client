import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";

function App() {
  const { pathname } = useLocation();
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_-5%,rgba(37,99,235,0.28),transparent_70%)]" />
        <div className="animate-aurora absolute -left-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-blue-600/30 via-sky-500/20 to-transparent blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[34rem] w-[34rem] rounded-full bg-gradient-to-tr from-indigo-600/20 via-blue-500/15 to-transparent blur-3xl" />
      </div>
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.07]" aria-hidden="true">
        <div
          className="animate-drift h-[130%] w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {!isAuthRoute && <Navbar />}

      <main className="relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
