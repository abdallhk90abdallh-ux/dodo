"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  // Fetch products and pick the first 4 (or any logic you prefer)
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Randomly select 4 featured products or just take the first 4
        setFeatured(data.slice(0, 4));
      })
      .catch((err) => console.error("Failed to load featured products:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white rounded-xl">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left mb-10 lg:mb-0">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
            Premium Bags for
            <span className="text-blue-600"> Every Journey</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Discover our collection of handcrafted bags designed for style and functionality.
            From everyday essentials to luxury statements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              href="/shop"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium 
                hover:bg-blue-700 transition-colors duration-300"
            >
              Shop Now
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-medium 
                hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Content - Featured Products */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {featured.length > 0 ? (
            featured.map((product) => (
              <div
                key={product._id}
                className="relative h-48 lg:h-64 rounded-2xl overflow-hidden group"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow">
                  {product.name}
                </p>
              </div>
            ))
          ) : (
            // Skeleton loading placeholders
            Array(4)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="h-48 lg:h-64 rounded-2xl bg-gray-200 animate-pulse"
                />
              ))
          )}
        </div>
      </section>
    </div>
  );
}
