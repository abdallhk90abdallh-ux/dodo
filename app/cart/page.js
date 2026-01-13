// ...existing code...
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";


export default function CartPage() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!session) {
      alert("Please log in to proceed to checkout");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total: total + 50,
        }),
      });

      if (res.ok) {
        await res.json();
        alert("✅ Order placed successfully!");
        clearCart();
        router.push("/orders");
      } else {
        const err = await res.json();
        alert(`❌ ${err.error}`);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };


  const format = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(
      v
    );

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl">
        <div className="max-w-xl w-full text-center bg-white/60 backdrop-blur-sm rounded-2xl p-10 shadow-lg">
          {/* <div className="text-6xl mb-6">👜</div> */}
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven&apos;t added anything yet. Explore our latest
            collection and find the perfect bag.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/shop"
              className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
            >
              Shop Bags
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-100 transition"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 rounded-2xl">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-sm text-gray-500">
            {cart.length} item{cart.length > 1 ? "s" : ""}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <section className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="w-28 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={item.image || "/bag-placeholder.jpg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {item.description || "Stylish, durable & versatile"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {format(item.price || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQuantity(item.cartId)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-medium">{item.quantity || 1}</span>
                      <button
                        onClick={() => increaseQuantity(item.cartId)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </section>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{format(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimated shipping</span>
                  <span>{format(50)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>{format(total + 50)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-5 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Checkout"}
                </button>


                <Link
                  href="/shop"
                  className="block text-center mt-3 text-sm text-gray-600 hover:underline"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
// ...existing code...