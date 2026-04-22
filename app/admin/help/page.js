"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminHelp() {
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
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">?? Admin Help</h1>
      <p className="text-gray-600 mb-6">Helpful guides and tutorials for administrators.</p>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">How to Use AI in MongoDB Atlas Data Explorer</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Open MongoDB Atlas.</li>
          <li>Go to Data Explorer.</li>
          <li>Choose your database and collection.</li>
          <li>Open the Documents tab.</li>
          <li>Click Generate Query.</li>
          <li>Type your question in English.</li>
          <li>Atlas generates a query in the Filter bar.</li>
          <li>Click Find to run it.</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500">
          Important notes: The AI feature must be enabled in the project settings. It uses generative AI (Azure OpenAI) to generate queries. Your prompt and collection schema may be sent for processing, but your database documents and credentials are not stored by the AI provider. Because it is generative AI, you should review the query before running it.
        </p>
      </div>
    </div>
  );
}
