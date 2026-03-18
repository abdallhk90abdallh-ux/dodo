"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [metrics, setMetrics] = useState({
    productsCount: 0,
    ordersCount: 0,
    usersCount: 0,
    topSelling: null,
    leastSelling: null
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") return;

    let mounted = true;
    setLoadingMetrics(true);

    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data) setMetrics({
          productsCount: data.productsCount || 0,
          ordersCount: data.ordersCount || 0,
          usersCount: data.usersCount || 0,
          topSelling: data.topSelling || null,
          leastSelling: data.leastSelling || null
        });
      })
      .catch((err) => console.error('Failed to load metrics', err))
      .finally(() => { if (mounted) setLoadingMetrics(false); });

    return () => { mounted = false; };
  }, [session, status]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">📊 Admin Dashboard</h1>
      <p className="text-gray-600">Quick overview and metrics for administrators.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <MetricCard title="Products" value={metrics.productsCount} loading={loadingMetrics} />
        <MetricCard title="Orders" value={metrics.ordersCount} loading={loadingMetrics} />
        <MetricCard title="Users" value={metrics.usersCount} loading={loadingMetrics} />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProductMetric title="Top Selling Product" product={metrics.topSelling} loading={loadingMetrics} />
        <ProductMetric title="Least Selling Product" product={metrics.leastSelling} loading={loadingMetrics} />
      </div>
    </div>
  );
}

// Reusable small card
function MetricCard({ title, value, loading }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{loading ? '—' : value}</div>
    </div>
  );
}

// Product metric card
function ProductMetric({ title, product, loading }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {loading ? (
        <div>Loading...</div>
      ) : product ? (
        <div className="flex items-center gap-4">
          <img
            src={product.image || '/bag-placeholder.jpg'}
            alt={product.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">Sold: {product.totalSold}</div>
            {product.sizes && Object.entries(product.sizes).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(product.sizes).map(([size, qty]) =>
                  qty > 0 ? <span key={size} className="px-2 py-1 border rounded text-sm">{size} ({qty})</span> : null
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>No data</div>
      )}
    </div>
  );
}