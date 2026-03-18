"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white/80 backdrop-blur-md shadow-md p-6">
        <h1 className="text-2xl font-bold mb-8">🛍️ Admin Panel</h1>
        <nav className="flex flex-col gap-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeTab === "products"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeTab === "categories"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeTab === "settings"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100"
            }`}
          >
            Settings
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-white/60 backdrop-blur-md">
        {activeTab === "products" ? (
          <ProductsAdmin />
        ) : activeTab === "categories" ? (
          <CategoriesAdmin />
        ) : activeTab === "orders" ? (
          <OrdersAdmin />
        ) : (
          <SettingsAdmin />
        )}
      </main>
    </div>
  );
}

// ========================== ProductsAdmin ==========================
function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState("published");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    imagesInput: "",
    description: "",
    category: "",
    isTesting: true,
    requiresSize: false,
    sizesInput: "", // S,M,L or 36,37,38
    stockInput: "", // 2,5,10
  });

  useEffect(() => {
    fetchProducts();
  }, [mode]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const images = newProduct.imagesInput.split(",").map(s => s.trim()).filter(Boolean);

    // Convert sizes + stock to an object
    const sizesArray = newProduct.sizesInput.split(",").map(s => s.trim()).filter(Boolean);
    const stockArray = newProduct.stockInput.split(",").map(n => Number(n.trim()) || 0);
    const sizesObject = {};

    sizesArray.forEach((size, i) => {
      if (stockArray[i] > 0) sizesObject[size] = stockArray[i];
    });

    if (newProduct.requiresSize && Object.keys(sizesObject).length === 0) {
      alert("Please enter sizes and matching stock values when product requires sizes.");
      return;
    }

    const payload = {
      name: newProduct.name,
      price: Number(newProduct.price),
      images,
      image: images[0] || "",
      description: newProduct.description,
      category: newProduct.category,
      isTesting: newProduct.isTesting,
      isPublished: newProduct.isTesting ? false : true,
      requiresSize: newProduct.requiresSize,
      voteCount: Number(newProduct.voteCount || 0),
      productCounter: Number(newProduct.productCounter || 0),
      sizes: sizesObject,
    };

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if(res.ok) {
      setNewProduct({
        name: "",
        price: "",
        imagesInput: "",
        description: "",
        category: "",
        isTesting: true,
        requiresSize: false,
        productCounter: 0,
        voteCount: 0,
        sizesInput: "",
        stockInput: "",
      });
      fetchProducts();
    } else {
      alert("Failed to add product");
    }
  }

  async function chooseWinner(productId) {
    if (!confirm("Promote this product as winner and move to main page?")) return;
    const res = await fetch("/api/admin/products/winner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) fetchProducts();
    else alert("Failed to choose winner");
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
    else alert("Failed to delete product");
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">📦 Manage Products</h2>
        <div className="flex gap-2">
          {[
            { key: "published", label: "Published" },
            { key: "testing", label: "Testing Pool" },
            { key: "all", label: "All" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={`px-3 py-1 rounded-lg border ${
                mode === item.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white shadow p-6 rounded-xl">
        <input type="text" placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="border p-2 rounded" required />
        <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="border p-2 rounded" required />
        <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="border p-2 rounded" required>
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>
        <input type="text" placeholder="Image URLs (comma separated)" value={newProduct.imagesInput} onChange={e => setNewProduct({ ...newProduct, imagesInput: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Sizes (comma separated, S,M,L or 36,37)" value={newProduct.sizesInput} onChange={e => setNewProduct({ ...newProduct, sizesInput: e.target.value })} className="border p-2 rounded" />
        <input type="text" placeholder="Stock per size (comma separated, 2,5,10)" value={newProduct.stockInput} onChange={e => setNewProduct({ ...newProduct, stockInput: e.target.value })} className="border p-2 rounded" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={newProduct.requiresSize} onChange={e => setNewProduct({ ...newProduct, requiresSize: e.target.checked })} className="w-4 h-4" />
          <span className="text-sm">Require size selection (show size buttons to users)</span>
        </label>
        <input type="number" placeholder="Initial votes (0)" value={newProduct.voteCount} onChange={e => setNewProduct({ ...newProduct, voteCount: Number(e.target.value) })} className="border p-2 rounded" />
        <input type="number" placeholder="Product counter" value={newProduct.productCounter} onChange={e => setNewProduct({ ...newProduct, productCounter: Number(e.target.value) })} className="border p-2 rounded" />
        <label className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={newProduct.isTesting} onChange={e => setNewProduct({ ...newProduct, isTesting: e.target.checked })} className="w-4 h-4" />
          <span className="text-sm">Add this product to testing pool</span>
        </label>
        <button type="submit" className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">➕ Add Product</button>
      </form>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center">
            <img src={product.images?.[0] || product.image || "/bag-placeholder.jpg"} alt={product.name} className="w-40 h-40 object-cover rounded-lg mb-4" />
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-500">${product.price}</p>
            <p className="text-sm text-blue-600 font-medium capitalize">{product.category}</p>
            {product.requiresSize && <p className="text-xs text-red-600 font-semibold">Size required</p>}
            <p className="text-sm text-gray-400">{product.description}</p>
            <p className="text-xs text-gray-500 mt-1">Status: {product.isTesting ? "Testing" : product.isPublished ? "Published" : "Hidden"}</p>
            <p className="text-xs text-gray-500">Votes: {product.voteCount || 0} | Counter: {product.productCounter || 0}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {product.sizes && Object.entries(product.sizes).map(([size, qty]) => (
                qty > 0 ? <span key={size} className="px-2 py-1 border rounded text-sm">{size} ({qty})</span> : null
              ))}
            </div>

            {product.isTesting && (
              <button onClick={() => chooseWinner(product._id)} className="mt-3 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">🏆 Choose Winner</button>
            )}

            <button onClick={() => handleDeleteProduct(product._id)} className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">🗑️ Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================== CategoriesAdmin ==========================
function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory.trim().toLowerCase() }),
    });

    if (res.ok) {
      setNewCategory("");
      fetchCategories();
    } else {
      alert("Could not add category");
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchCategories();
    else alert("Failed to delete category");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">🗂️ Manage Categories</h2>
      <form onSubmit={handleAddCategory} className="flex gap-2">
        <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" className="border p-2 rounded flex-1" />
        <button className="bg-blue-600 px-4 py-2 text-white rounded">Add</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <span className="capitalize">{cat.name}</span>
            <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-600 hover:text-red-800">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================== OrdersAdmin ==========================
function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const url = search ? `/api/admin/orders?search=${encodeURIComponent(search)}` : "/api/admin/orders";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Cannot load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">📦 Manage Orders</h2>
      <div className="flex gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, phone, address" className="border p-2 rounded flex-1" />
        <button onClick={fetchOrders} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? <p className="text-gray-500">No orders found.</p> : orders.map((order) => (
          <div key={order._id} className="bg-white p-4 rounded shadow">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-semibold">Order #{order._id}</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm">Customer: {order.user?.name || "Guest"} ({order.user?.email || "no email"})</p>
            <p className="text-sm">Phone: {order.phone}, Address: {order.address}</p>
            <div className="mt-2 space-y-2">
              {order.items?.map((item, idx) => {
                const numericSize = Number(item.size);
                const isLargeSize = !Number.isNaN(numericSize) && numericSize >= 40;
                const sizeLabel = item.size ? (
                  isLargeSize ? `${item.size} (Large / 40+)` : item.size
                ) : "N/A";

                return (
                  <div key={idx} className="flex items-center gap-2 text-sm border rounded px-2 py-2">
                    <img src={item.image || "/bag-placeholder.jpg"} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <strong>{item.name}</strong> • {item.quantity} pcs
                      <div className="text-xs text-gray-600">Size: <span className="font-semibold">{sizeLabel}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm mt-2">Total: ${order.total?.toFixed(2) || order.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================== SettingsAdmin ==========================
function SettingsAdmin() {
  const [settings, setSettings] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    heroImageEnabled: false,
    heroImageWidth: 224,
    heroImageHeight: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setSettings((prev) => ({ ...prev, ...updated }));
      alert("Settings saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/settings/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const body = await res.json();
      if (body.url) {
        setSettings((prev) => ({ ...prev, heroImage: body.url, heroImageEnabled: true }));
        alert("Upload successful. Image URL set.");
      } else {
        throw new Error("No URL from upload");
      }
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please use direct URL if needed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-semibold">⚙️ Site Settings</h2>
      <form onSubmit={saveSettings} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium">Hero Title</label>
          <input
            value={settings.heroTitle}
            onChange={(e) => setSettings((prev) => ({ ...prev, heroTitle: e.target.value }))}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Hero Subtitle</label>
          <textarea
            value={settings.heroSubtitle}
            onChange={(e) => setSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
            className="border p-2 rounded w-full"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Hero Image URL</label>
            <input
              value={settings.heroImage}
              onChange={(e) => setSettings((prev) => ({ ...prev, heroImage: e.target.value }))}
              className="border p-2 rounded w-full"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Image Width (px)</label>
            <input
              type="number"
              value={settings.heroImageWidth}
              onChange={(e) => setSettings((prev) => ({ ...prev, heroImageWidth: Number(e.target.value) || 0 }))}
              className="border p-2 rounded w-full"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Image Height (px, 0=auto)</label>
            <input
              type="number"
              value={settings.heroImageHeight}
              onChange={(e) => setSettings((prev) => ({ ...prev, heroImageHeight: Number(e.target.value) || 0 }))}
              className="border p-2 rounded w-full"
              min={0}
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <label className="inline-flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={settings.heroImageEnabled}
              onChange={(e) => setSettings((prev) => ({ ...prev, heroImageEnabled: e.target.checked }))}
            />
            <span className="text-sm">Show hero image</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Upload Hero Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="mt-1" />
          {uploading ? <p className="text-sm text-gray-500">Uploading...</p> : null}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">Preview:</p>
        {settings.heroImageEnabled && settings.heroImage ? (
          <img
            src={settings.heroImage}
            alt="Preview"
            className="mt-3 rounded"
            style={{ width: settings.heroImageWidth || "auto", height: settings.heroImageHeight || "auto", maxWidth: "100%" }}
          />
        ) : (
          <p className="text-sm text-gray-400">Hero image is disabled.</p>
        )}
      </div>
    </div>
  );
}
