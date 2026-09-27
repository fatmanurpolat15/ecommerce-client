import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Products from "./pages/Products";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />  
          <Route path="/" element={<h1>Ana Sayfa</h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;