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

    if (rating !== 1 && rating !== -1) {
      setMessage("Please choose Like or Dislike.");
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
        Four products are currently in the voting pool. Choose Like or Dislike for each and leave feedback. Top-rated becomes featured.
      </p>

      {message && <div className="mb-4 text-sm text-red-600">{message}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow p-5">
            <div className="w-full h-64 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={product.images?.[0] || product.image || "/bag-placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.category}</p>
            <p className="my-2 text-gray-700">{product.description}</p>
            <p className="text-sm text-gray-500">Current avg rating: {product.avgRating || 0} ({product.ratingsCount || 0} votes)</p>


            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm">Your vote:</span>
              <button
                onClick={() => setRatingState((prev) => ({ ...prev, [product._id]: 1 }))}
                className={`px-3 py-1 rounded border ${ratingState[product._id] === 1 ? "bg-green-100 border-green-500" : "bg-white border-gray-300"}`}
              >
                👍 Like
              </button>
              <button
                onClick={() => setRatingState((prev) => ({ ...prev, [product._id]: -1 }))}
                className={`px-3 py-1 rounded border ${ratingState[product._id] === -1 ? "bg-red-100 border-red-500" : "bg-white border-gray-300"}`}
              >
                👎 Dislike
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Selected: {ratingState[product._id] === 1 ? "Like" : ratingState[product._id] === -1 ? "Dislike" : "None"}</p>

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
