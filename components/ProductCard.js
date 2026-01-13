"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const images = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : []);
  const [index, setIndex] = useState(0);
  const currentImage = images[index] || "/bag-placeholder.jpg";

  const handlePrev = (e) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const handleNext = (e) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setIndex((i) => (i + 1) % images.length);
  };

  const handleAddToCart = () => {
    addToCart(product, currentImage);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500); // Reset after 1.5 seconds
  };

  return (
    <div className="group bg-white rounded-3xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-100 w-full max-w-[320px] mx-auto relative overflow-hidden">
      {/* Product Badge */}
      {product.isNew && (
        <span className="absolute top-4 left-4 bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
          New
        </span>
      )}

      {/* Product Image with arrows */}
      <div className="w-36 h-36 md:w-48 md:h-48 overflow-hidden rounded-2xl mb-4 relative">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        {/* Left arrow */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white"
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white"
          >
            ›
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2 w-full">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm">{product.description}</p>
        <p className="text-2xl font-bold text-gray-900 flex items-start justify-center">
          <span className="text-xs font-medium mr-1 mt-1">EGP</span>
          <span>{product.price}</span>
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={added}
          className={`w-full mt-4 px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            added
              ? "bg-green-500 text-white cursor-default"
              : "bg-black text-white hover:bg-gray-800 active:scale-95"
          }`}
        >
          {added ? (
            <>
              ✅ Added!
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Floating Confirmation Animation */}
      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute text-green-600 font-semibold text-sm"
          >
            ✅ Added to Cart
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
