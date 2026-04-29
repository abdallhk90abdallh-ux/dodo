"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MusicAdmin from "@/components/MusicAdmin";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");

  // Authentication & Role Protection
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen font-sans bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm p-6 fixed h-full z-10">
        <div className="flex items-center gap-2 mb-10">
          <span className="text-3xl">🛍️</span>
          <h1 className="text-xl font-bold tracking-tight">Dodo Admin</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          {[
            { id: "products", label: "Products", icon: "📦" },
            { id: "categories", label: "Categories", icon: "🗂️" },
            { id: "orders", label: "Orders", icon: "📋" },
            { id: "music", label: "Music Manager", icon: "🎵" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-blue-50 text-gray-600"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold capitalize text-gray-900">
              {activeTab} Management
            </h2>
            <p className="text-gray-500">Configure and monitor your store assets below.</p>
          </header>

          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[70vh]">
            {activeTab === "products" && <ProductsAdmin />}
            {activeTab === "categories" && <CategoriesAdmin />}
            {activeTab === "orders" && <OrdersAdmin />}
            {activeTab === "music" && <MusicAdmin />}
            {activeTab === "settings" && <SettingsAdmin />}
          </section>
        </div>
      </main>
    </div>
  );
}

// ========================== ProductsAdmin Sub-Component ==========================
function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState("published");
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", imagesInput: "", description: "",
    category: "", isTesting: true, requiresSize: false,
    sizesInput: "", stockInput: "", productCounter: 0, voteCount: 0
  });

  useEffect(() => { fetchProducts(); }, [mode]);
  useEffect(() => { fetchCategories(); }, []);

  async function fetchProducts() {
    const res = await fetch(`/api/admin/products?mode=${mode}`);
    const data = await res.json();
    setProducts(data);
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) { console.error(err); }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const images = newProduct.imagesInput.split(",").map(s => s.trim()).filter(Boolean);
    const sizesArray = newProduct.sizesInput.split(",").map(s => s.trim()).filter(Boolean);
    const stockArray = newProduct.stockInput.split(",").map(n => Number(n.trim()) || 0);
    const sizesObject = {};
    sizesArray.forEach((size, i) => { if (stockArray[i] > 0) sizesObject[size] = stockArray[i]; });

    const payload = { 
      ...newProduct, 
      images, 
      image: images[0] || "", 
      price: Number(newProduct.price), 
      sizes: sizesObject, 
      isPublished: !newProduct.isTesting 
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if(res.ok) {
      alert("Product added successfully!");
      fetchProducts();
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Delete product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
  }

  async function chooseWinner(productId) {
    const res = await fetch("/api/admin/products/winner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) fetchProducts();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="font-bold text-gray-700">Inventory Status</h3>
        <div className="flex gap-2">
          {["published", "testing", "all"].map(m => (
            <button 
              key={m} 
              onClick={() => setMode(m)} 
              className={`px-4 py-1 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? "bg-white shadow-sm text-blue-600 border border-gray-200" : "text-gray-400"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
        <input type="text" placeholder="Name" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
        <input type="number" placeholder="Price" className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
        <select className="p-3 border rounded-lg bg-white" onChange={e => setNewProduct({...newProduct, category: e.target.value})} required>
          <option value="">Category</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <button className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Add Product</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p._id} className="border border-gray-100 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <img src={p.images?.[0] || p.image || "/bag-placeholder.jpg"} className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="font-bold">{p.name}</h4>
            <p className="text-blue-600 font-bold">${p.price}</p>
            <div className="flex gap-2 mt-4">
               {p.isTesting && <button onClick={() => chooseWinner(p._id)} className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm">Winner</button>}
               <button onClick={() => handleDeleteProduct(p._id)} className="bg-red-50 text-red-500 px-3 py-1 rounded-md text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================== CategoriesAdmin Sub-Component ==========================
function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.toLowerCase() }),
    });
    setNewCategory("");
    fetchCategories();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddCategory} className="flex gap-4">
        <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category Name" className="flex-1 p-3 border rounded-xl" />
        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Add</button>
      </form>
      <div className="grid grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center capitalize font-medium">
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================== OrdersAdmin Sub-Component ==========================
function OrdersAdmin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <p className="text-gray-400">No recent orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg">Order #{order._id.slice(-6)}</h4>
              <p className="text-gray-500 text-sm">Customer: {order.phone} | {order.address}</p>
            </div>
            <div className="text-right font-black text-green-600 text-xl">${order.total}</div>
          </div>
        ))
      )}
    </div>
  );
}

// ========================== SettingsAdmin Sub-Component ==========================
function SettingsAdmin() {
  const [settings, setSettings] = useState({ heroTitle: "", heroSubtitle: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));
  }, []);

  async function save(e) {
    e.preventDefault();
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    alert("Settings updated!");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Home Page Headline</label>
          <input 
            value={settings.heroTitle} 
            onChange={e => setSettings({...settings, heroTitle: e.target.value})} 
            className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Description Subtitle</label>
          <textarea 
            value={settings.heroSubtitle} 
            onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} 
            className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" 
            rows={4} 
          />
        </div>
        <button className="bg-blue-600 text-white w-full py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition">
          Save All Settings
        </button>
      </form>
    </div>
  );
}