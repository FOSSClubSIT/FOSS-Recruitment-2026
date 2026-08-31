"use client";

import { useState } from "react";

export default function SaveTestPage() {
  const [result, setResult] = useState("");

  async function savePortfolio() {
    const response = await fetch(
      "/api/save-portfolio",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "cmqgwvi7h0000f8ucupr7jvk8",

          portfolioData: {
            personalInfo: {
              fullName: "Raam Bhanushali",
            },

            summary:
              "AI & Full Stack Developer",

            skills: [
              {
                name: "React",
              },
              {
                name: "Node.js",
              },
            ],

            experience: [],
            projects: [],
            education: [],
            certifications: [],
            socialLinks: [],
          },
        }),
      }
    );

    const data = await response.json();

    setResult(
      JSON.stringify(data, null, 2)
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Save Portfolio Test
      </h1>

      <button
        onClick={savePortfolio}
        className="mt-6 rounded border px-4 py-2"
      >
        Save Portfolio
      </button>

      {result && (
        <pre className="mt-6 rounded border p-4 overflow-auto">
          {result}
        </pre>
      )}
    </main>
  );
}