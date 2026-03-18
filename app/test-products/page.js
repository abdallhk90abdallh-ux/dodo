"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function TestProductsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [ratingState, setRatingState] = useState({});
  const [commentState, setCommentState] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products?testing=true");
        const data = await res.json();
        setProducts(data.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  async function submitRating(productId) {
    if (!session) {
      setMessage("Please log in to rate test products.");
      return;
    }

    const rating = ratingState[productId];
    const comment = commentState[productId];

    if (!rating || rating < 1 || rating > 5) {
      setMessage("Please select a rating between 1 and 5.");
      return;
    }

    try {
      const res = await fetch("/api/products/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rating failed");
      setMessage(`Rating submitted for product ${productId}.`);
      // refresh
      const updated = await fetch("/api/products?testing=true");
      setProducts(await updated.json());
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">🧪 Test Products Voting</h1>
      <p className="text-gray-600 text-center mb-6">
        Four products are currently in the voting pool. Vote 1-5 for each and leave feedback. Top-rated becomes featured.
      </p>

      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow p-5">
            <img
              src={product.images?.[0] || product.image || "/bag-placeholder.jpg"}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.category}</p>
            <p className="my-2 text-gray-700">{product.description}</p>
            <p className="text-sm text-gray-500">Current avg rating: {product.avgRating || 0} ({product.ratingsCount || 0} votes)</p>

            <div className="flex items-center gap-2 mt-3">
              <label className="text-sm">Your rating:</label>
              <select
                value={ratingState[product._id] || ""}
                onChange={(e) =>
                  setRatingState((prev) => ({ ...prev, [product._id]: Number(e.target.value) }))
                }
                className="border rounded px-2 py-1"
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Optional comment"
              value={commentState[product._id] || ""}
              onChange={(e) => setCommentState((prev) => ({ ...prev, [product._id]: e.target.value }))}
              className="w-full border rounded p-2 mt-3"
            />

            <button
              onClick={() => submitRating(product._id)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Submit rating
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
