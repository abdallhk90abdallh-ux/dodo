"use client";
import React from "react";
import DataFetcher from "@/components/DataFetcher";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DataExplorer() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-2">📊 Data Explorer</h1>
      <p className="text-gray-600 mb-8">Browse and filter your MongoDB data in real-time.</p>
      <DataFetcher />
    </div>
  );
}