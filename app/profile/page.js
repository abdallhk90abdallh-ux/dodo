"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        address: session.user.address || "",
      });
    }
  }, [session]);

  if (status === "loading") return <p className="text-center mt-20">Loading...</p>;
  if (!session)
    return <p className="text-center mt-20 text-lg">Please log in to view your profile.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: form.phone,
        address: form.address,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Profile updated successfully!");
      update();
      setEditing(false);
    } else {
      alert(data.error || "Failed to update profile");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[400px]">
        <h1 className="text-2xl font-bold text-center mb-6">Your Profile</h1>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              disabled
              className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              disabled={!editing}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`border p-2 w-full rounded ${
                editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              disabled={!editing}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={`border p-2 w-full rounded ${
                editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Save button */}
          {editing && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </form>

        {/* Edit and My Orders buttons */}
        <div className="mt-4 space-y-3">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Edit Profile
            </button>
          )}

          {/* ✅ New My Orders button */}
          <button
            onClick={() => router.push("/orders")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            🛍️ View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}
