"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratedProducts, setRatedProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
        // initialize rated products local state (none rated yet)
        setRatedProducts([]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading your orders...
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <h2 className="text-2xl font-semibold mb-4">No orders yet 😢</h2>
        <p className="mb-6">You haven’t placed any orders yet.</p>
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
        >
          Shop Now
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: <span className="font-medium">{order._id}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on:{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-md object-cover border"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-semibold text-gray-900">EGP {item.price * item.quantity}</p>

                      <div className="mt-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const rawPid = item.productId || item._id;
                          // normalize product id to string
                          const pid = rawPid && rawPid._id ? String(rawPid._id) : String(rawPid);
                          const isRated = ratedProducts.includes(pid);

                          return (
                            <button
                              key={s}
                              onClick={async () => {
                                if (isRated) return;
                                try {
                                  const res = await fetch('/api/products/rate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ productId: pid, rating: s })
                                  });
                                  if (!res.ok) {
                                    const errBody = await res.json().catch(() => ({}));
                                    throw new Error(errBody.error || 'Failed to submit rating');
                                  }

                                  // mark locally as rated; UI will persist after refresh because DB updated
                                  setRatedProducts((prev) => [...prev, pid]);
                                  alert('Thanks for your rating!');
                                } catch (err) {
                                  console.error(err);
                                  alert(err.message || 'Failed to submit rating');
                                }
                              }}
                              className={`text-xl leading-none ${isRated ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                              aria-label={`Rate ${s} star`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <p>
                  <span className="font-medium">Phone:</span> {order.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {order.address}
                </p>
                <p className="font-semibold text-gray-900">
                  Total: EGP {order.total}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
