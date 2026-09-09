"use client";

import { useState } from "react";

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/parse-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setResult(
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error(error);

      setResult(
        JSON.stringify(
          {
            error: "Request failed",
          },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        Resume AI Test
      </h1>

      <p className="mt-2 text-gray-500">
        Upload a resume and generate
        PortfolioData using Ollama.
      </p>

      <div className="mt-8 rounded-lg border p-8">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUpload}
        />
      </div>

      {loading && (
        <p className="mt-6">
          Parsing resume...
        </p>
      )}

      {result && (
        <pre className="mt-6 overflow-auto rounded-lg border p-4 text-sm">
          {result}
        </pre>
      )}
    </main>
  );
}