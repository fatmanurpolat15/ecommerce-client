import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
}

function Products() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/products";
      const params = new URLSearchParams();
      
      if (search) {
        // Arama varsa /products/search endpoint'ini kullan
        url = "/products/search";
        params.append("keyword", search);
      } else if (categoryId) {
        url = `/products/category/${categoryId}`;
      }
      
      params.append("page", "0");
      params.append("size", "10");
      
      const res = await api.get(`${url}?${params.toString()}`);
      
      // Backend Page döndürüyor, content içinde ürünler var
      setProducts(res.data.content || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h1>Ürünler</h1>
        {isAdmin && <button>+ Ürün Ekle</button>}
      </div>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", flex: 1 }}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")} style={{ padding: "0.5rem" }}>
          <option value="">Tüm Kategoriler</option>
          {/* Kategoriler API'den çekilebilir */}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: "8px" }}>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p style={{ fontWeight: "bold", color: "green" }}>{p.price} TL</p>
            <small>{p.categoryName}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;