"use client";
import React, { useState, useEffect } from "react";

export default function DataFetcher() {
  const [collection, setCollection] = useState("products");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const collections = ["products", "orders", "users", "categories"];

  const fetchData = async (filterObj = null) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (filterObj) {
        // POST with filter
        response = await fetch("/api/admin/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collection: collection,
            filter: filterObj,
          }),
        });
      } else {
        // GET all data
        response = await fetch(`/api/admin/query?collection=${collection}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [collection]);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">MongoDB Data Fetcher</h2>

      {/* Collection Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Collection:</label>
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        >
          {collections.map((col) => (
            <option key={col} value={col}>
              {col.charAt(0).toUpperCase() + col.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Examples */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {collection === "products" && (
          <>
            <button
              onClick={() => fetchData({ price: { $gt: 50 } })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Price &gt; $50
            </button>
            <button
              onClick={() => fetchData({ isPublished: true })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Published Only
            </button>
          </>
        )}
        {collection === "orders" && (
          <>
            <button
              onClick={() => fetchData({ status: "pending" })}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Pending Orders
            </button>
            <button
              onClick={() => fetchData({ status: "delivered" })}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Delivered Orders
            </button>
          </>
        )}
        <button
          onClick={() => fetchData()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Reset Filters
        </button>
      </div>

      {/* Status */}
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Data Display */}
      {!loading && data.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Results ({data.length}):</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  {Object.keys(data[0]).slice(0, 5).map((key) => (
                    <th key={key} className="border border-gray-300 px-4 py-2 text-left">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-gray-100">
                    {Object.keys(item)
                      .slice(0, 5)
                      .map((key) => (
                        <td key={key} className="border border-gray-300 px-4 py-2">
                          {typeof item[key] === "object"
                            ? JSON.stringify(item[key]).substring(0, 50)
                            : String(item[key]).substring(0, 50)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <p className="text-gray-600 mt-2">... and {data.length - 10} more</p>
            )}
          </div>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <p className="text-gray-500">No data found</p>
      )}
    </div>
  );
}