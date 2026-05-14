"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

function hasStock(product) {
  if (!product) return false;
  if (product.sizes) {
    const sizes = typeof product.sizes.get === "function"
      ? Object.fromEntries(product.sizes)
      : product.sizes;
    return Object.values(sizes).some((qty) => Number(qty) > 0);
  }
  return true;
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFiltered(data.filter(hasStock));
      });
  }, []);

  function applyFilters(categoryValue, subcategoryValue, searchValue) {
    const q = searchValue.trim().toLowerCase();
    let results = products.filter(hasStock);
    if (categoryValue !== "all") results = results.filter((p) => p.category === categoryValue);
    if (subcategoryValue !== "all") results = results.filter((p) => p.subcategory === subcategoryValue);
    if (q) results = results.filter((p) => p.name.toLowerCase().includes(q));
    setFiltered(results);
  }

  function handleCategoryChange(cat) {
    setCategory(cat);
    setSubcategory("all");
    applyFilters(cat, "all", search);
  }

  function handleSubcategoryChange(sub) {
    setSubcategory(sub);
    applyFilters(category, sub, search);
  }

  const [categories, setCategories] = useState([{ name: "all", subcategories: [] }]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories([{ name: "all", subcategories: [] }, ...data]))
      .catch(() => { });
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
              const value = e.target.value;
              setSearch(value);
              applyFilters(category, subcategory, value);
            }}
            placeholder="Search products by name..."
            className="max-w-xl w-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-sm placeholder-gray-200"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`px-6 py-2.5 rounded-full border-2 transition-all duration-300 text-sm font-medium
                ${category === cat.name
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 hover:border-black border-gray-200"
                }`}>
              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
            </button>
          ))}
        </div>
        {category !== "all" && categories.find((cat) => cat.name === category)?.subcategories?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => handleSubcategoryChange("all")}
              className={`px-5 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium
                ${subcategory === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-600 border-gray-200"
                }`}>
              All
            </button>
            {categories.find((cat) => cat.name === category)?.subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => handleSubcategoryChange(sub)}
                className={`px-5 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium
                  ${subcategory === sub
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:border-blue-600 border-gray-200"
                  }`}>
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </button>
            ))}
          </div>
        )}
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