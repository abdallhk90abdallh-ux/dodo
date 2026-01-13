"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

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
    const q = search.trim().toLowerCase();
    let results = products;
    if (cat !== "all") results = results.filter((p) => p.category === cat);
    if (q) results = results.filter((p) => p.name.toLowerCase().includes(q));
    setFiltered(results);
  }

  const [categories, setCategories] = useState(["all"]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(["all", ...data.map((c) => c.name)]))
      .catch(() => {});
  }, []);

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

      {/* Search + Category Filter Bar */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="w-full flex justify-center">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              const q = e.target.value.trim().toLowerCase();
              let results = products;
              if (category !== "all") results = results.filter((p) => p.category === category);
              if (q) results = results.filter((p) => p.name.toLowerCase().includes(q));
              setFiltered(results);
            }}
            placeholder="Search products by name..."
            className="max-w-xl w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-sm placeholder-gray-200"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-full border-2 transition-all duration-300 text-sm font-medium
                ${
                  category === cat
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 hover:border-black border-gray-200"
                }`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <div key={product._id}>
              <ProductCard product={product} />
            </div>
          ))
        ) : search ? (
          // When user searched but there are no results, show empty results (no message)
          <div className="col-span-full h-24" />
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