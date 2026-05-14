"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [subcategory, setSubcategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const categoryProducts = data.filter((p) => p.category === category);
        setProducts(categoryProducts);
        setFiltered(categoryProducts);
        setSubcategory("all");
      });
  }, [category]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => { });
  }, []);

  function handleSubcategoryChange(sub) {
    setSubcategory(sub);
    let results = products;
    if (sub !== "all") results = results.filter((p) => p.subcategory === sub);
    setFiltered(results);
  }

  const currentCategory = categories.find(cat => cat.name === category);
  const subcategories = currentCategory ? ["all", ...currentCategory.subcategories] : ["all"];

  return (
    <div className="container mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {category} Bags
      </h1>

      {subcategories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="text-gray-700 text-sm font-medium">Filter by subcategory:</span>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => handleSubcategoryChange(sub)}
              className={`px-4 py-2 rounded-full border-2 transition-all duration-300 text-sm font-medium
                ${subcategory === sub
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-600 border-gray-200"
                }`}>
              {sub === "all" ? "All" : sub.charAt(0).toUpperCase() + sub.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="text-gray-500">No products found for this category.</p>
        )}
      </div>
    </div>
  );
}
