"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFiltered(data);
      });
  }, []);

  function handleCategoryChange(cat) {
    setCategory(cat);
    if (cat === "all") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === cat));
    }
  }

  const categories = ["all", "man", "woman", "sport", "kids"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Discover Our Collection
        </h1>
        <p className="text-white text-lg max-w-2xl mx-auto">
          Explore our carefully curated selection of premium bags for every occasion
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-6 py-2.5 rounded-full border-2 transition-all duration-300 text-sm font-medium
              ${
                category === cat
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 hover:border-black border-gray-200"
              }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <div key={product._id}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg">
              No products found in this category
            </div>
          </div>
        )}
      </div>
    </div>
  );
}