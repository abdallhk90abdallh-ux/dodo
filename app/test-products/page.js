"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function TestProductsPage() {
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [ratingState, setRatingState] = useState({});
  const [commentState, setCommentState] = useState({});
  const [imageIndex, setImageIndex] = useState({});
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Rating failed");
      }

      setMessage(`Rating submitted for product ${productId}.`);

      // Refresh products
      const updated = await fetch("/api/products?testing=true");
      const updatedData = await updated.json();

      setProducts(updatedData.slice(0, 4));
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-6">
        🧪 Test Products Voting
      </h1>

      <p className="text-gray-600 text-center mb-6">
        Four products are currently in the voting pool. Choose Like or
        Dislike for each and leave feedback. Top-rated becomes featured.
      </p>

      {message && (
        <div className="mb-4 text-sm text-red-600 text-center">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => {
          const images = product.images?.length
            ? product.images
            : product.image
            ? [product.image]
            : ["/bag-placeholder.jpg"];

          const index = imageIndex[product._id] || 0;
          const currentImage = images[index];

          return (
            <div
              key={product._id}
              className="group bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-100 w-full max-w-[320px] mx-auto relative overflow-hidden"
            >
              <div className="w-36 h-36 md:w-48 md:h-48 overflow-hidden rounded-2xl mb-4 relative">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setImageIndex((prev) => ({
                          ...prev,
                          [product._id]:
                            (index - 1 + images.length) % images.length,
                        }))
                      }
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                    >
                      ‹
                    </button>

                    <button
                      onClick={() =>
                        setImageIndex((prev) => ({
                          ...prev,
                          [product._id]:
                            (index + 1) % images.length,
                        }))
                      }
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-2 w-full">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {product.name}
                </h3>

                <p className="text-gray-500 text-sm">
                  {product.description}
                </p>

                <div className="flex items-center justify-center gap-4">
                  <p className="text-2xl font-bold text-gray-900 flex items-start">
                    <span className="text-xs font-medium mr-1 mt-1">
                      EGP
                    </span>

                    <span>{product.price}</span>
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="text-yellow-400 font-semibold">
                      {product.avgRating
                        ? product.avgRating.toFixed?.(1) ??
                          product.avgRating
                        : "0.0"}
                    </div>

                    <div className="text-gray-400">
                      ({product.ratingsCount || 0})
                    </div>
                  </div>
                </div>

                {product.subcategory && (
                  <p className="text-xs uppercase tracking-[0.12em] text-gray-400">
                    {product.subcategory}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 justify-center">
                  <span className="text-sm">Your vote:</span>

                  <button
                    onClick={() =>
                      setRatingState((prev) => ({
                        ...prev,
                        [product._id]: 1,
                      }))
                    }
                    className={`px-3 py-1 rounded border ${
                      ratingState[product._id] === 1
                        ? "bg-green-100 border-green-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    👍 Like
                  </button>

                  <button
                    onClick={() =>
                      setRatingState((prev) => ({
                        ...prev,
                        [product._id]: -1,
                      }))
                    }
                    className={`px-3 py-1 rounded border ${
                      ratingState[product._id] === -1
                        ? "bg-red-100 border-red-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    👎 Dislike
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Selected:{" "}
                  {ratingState[product._id] === 1
                    ? "Like"
                    : ratingState[product._id] === -1
                    ? "Dislike"
                    : "None"}
                </p>

                <textarea
                  placeholder="Leave feedback..."
                  value={commentState[product._id] || ""}
                  onChange={(e) =>
                    setCommentState((prev) => ({
                      ...prev,
                      [product._id]: e.target.value,
                    }))
                  }
                  className="w-full mt-3 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />

                <button
                  onClick={() => submitRating(product._id)}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                >
                  Submit rating
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}