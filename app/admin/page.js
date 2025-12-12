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
            onClick={() => setActiveTab("orders")}
            className={`text-left px-4 py-2 rounded-lg transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-100"
            }`}
          >
            Orders
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-white/60 backdrop-blur-md">
        {activeTab === "products" ? <ProductsAdmin /> : <OrdersAdmin />}
      </main>
    </div>
  );
}

function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduct, price: Number(newProduct.price) }),
    });
    if (res.ok) {
      setNewProduct({
        name: "",
        price: "",
        image: "",
        description: "",
        category: "",
      });
      fetchProducts();
    } else {
      alert("Failed to add product");
    }
  }

  async function handleDeleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchProducts();
    else alert("Failed to delete product");
  }

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-semibold">📦 Manage Products</h2>

      <form
        onSubmit={handleAddProduct}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white shadow p-6 rounded-xl"
      >
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <select
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="back">Back</option>
          <option value="leather">Leather</option>
          <option value="cross">Cross</option>
          <option value="kids">Kids</option>
        </select>
        <input
          type="text"
          placeholder="Image URL"
          value={newProduct.image}
          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          ➕ Add Product
        </button>
      </form>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center"
          >
            <img
              src={product.image || "/bag-placeholder.jpg"}
              alt={product.name}
              className="w-40 h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-500">${product.price}</p>
            <p className="text-sm text-blue-600 font-medium capitalize">{product.category}</p>
            <p className="text-sm text-gray-400">{product.description}</p>
            <button
              onClick={() => handleDeleteProduct(product._id)}
              className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const updated = await res.json();
      setOrders((prev) => prev.map((order) => (order._id === id ? updated : order)));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center text-gray-500 text-lg py-20">
        Loading orders...
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">🧾 Manage Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left">Order ID</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Total (EGP)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-3 font-mono text-gray-600">{order._id}</td>
                    <td className="p-3">{order.user?.name || "N/A"}</td>
                    <td className="p-3">{order.phone}</td>
                    <td className="p-3">{order.address}</td>
                    <td className="p-3 font-semibold">{order.total}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="border rounded-lg px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() =>
                          setExpandedOrder(expandedOrder === order._id ? null : order._id)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {expandedOrder === order._id ? "Hide Details" : "View Details"}
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, "cancelled")}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>

                  {expandedOrder === order._id && (
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan="7" className="p-4">
                        <div className="space-y-3">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            🛍️ Order Items
                          </h4>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {order.items?.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 bg-white shadow-sm border rounded-lg p-3"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 rounded object-cover"
                                />
                                <div>
                                  <h5 className="font-medium text-gray-800">{item.name}</h5>
                                  <p className="text-sm text-gray-500">
                                    {item.quantity} × {item.price} EGP
                                  </p>
                                  <p className="text-sm font-semibold text-gray-700">
                                    = {item.quantity * item.price} EGP
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
