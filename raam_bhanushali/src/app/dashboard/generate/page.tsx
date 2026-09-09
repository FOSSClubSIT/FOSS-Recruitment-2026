"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const themes = [
  {
    id: "developer",
    name: "Developer",
    description: "Dark technical portfolio for developers and engineers.",
    style: "dark",
    accent: "cyan",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean and minimal design with a professional feel.",
    style: "light",
    accent: "indigo",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional layout for business and management profiles.",
    style: "corporate",
    accent: "slate",
  },
  {
    id: "ai",
    name: "AI Neon",
    description: "Futuristic interface for AI, ML and technology profiles.",
    style: "neon",
    accent: "cyan",
  },
] as const;

type TemplateId = (typeof themes)[number]["id"];

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [template, setTemplate] =
    useState<TemplateId>("developer");

  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        "/api/generate-portfolio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            template,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setResult(
          JSON.stringify(
            {
              error:
                data.error ||
                "Failed to generate portfolio.",
            },
            null,
            2
          )
        );

        return;
      }

      if (
        data.success &&
        data.portfolio?.slug
      ) {
        router.push(
          `/portfolio/${data.portfolio.slug}`
        );

        return;
      }

      setResult(
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error(
        "Portfolio generation error:",
        error
      );

      setResult(
        JSON.stringify(
          {
            error:
              "Something went wrong while generating the portfolio.",
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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">

        {/* HEADER */}

        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            ResumeForge AI
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Generate Your Portfolio
          </h1>

          <p className="mt-4 text-zinc-400 md:text-lg">
            Your resume has already been analyzed by
            AI. Choose a design that matches your
            professional identity.
          </p>
        </div>

        {/* RESUME STATUS */}

        <div className="mt-10 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xl text-green-400">
              ✓
            </div>

            <div>
              <h2 className="font-semibold text-green-400">
                Resume AI Analysis Complete
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Your structured resume data is ready.
              </p>
            </div>

          </div>
        </div>

        {/* THEME SELECTION */}

        <section className="mt-12">

          <div className="flex items-end justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-zinc-400">
                STEP 03
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Choose Your Theme
              </h2>
            </div>

            <p className="hidden text-sm text-zinc-500 md:block">
              Selected:{" "}
              <span className="text-cyan-400">
                {
                  themes.find(
                    (theme) =>
                      theme.id === template
                  )?.name
                }
              </span>
            </p>

          </div>

          {/* THEME CARDS */}

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {themes.map((theme) => {
              const selected =
                template === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    setTemplate(theme.id)
                  }
                  disabled={loading}
                  className={`group text-left transition ${
                    loading
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <div
                    className={`overflow-hidden rounded-2xl border transition ${
                      selected
                        ? "border-cyan-400 ring-2 ring-cyan-400/20"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >

                    {/* PREVIEW */}

                    <ThemePreview
                      theme={theme.id}
                      selected={selected}
                    />

                    {/* CARD INFO */}

                    <div className="bg-zinc-950 p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="text-lg font-semibold">
                            {theme.name}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-zinc-500">
                            {theme.description}
                          </p>
                        </div>

                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-cyan-400 bg-cyan-400 text-black"
                              : "border-zinc-700"
                          }`}
                        >
                          {selected && (
                            <span className="text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                </button>
              );
            })}

          </div>
        </section>

        {/* SELECTED THEME */}

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Selected Theme
          </p>

          <div className="mt-2 flex items-center justify-between">

            <p className="text-xl font-semibold text-cyan-400">
              {
                themes.find(
                  (theme) =>
                    theme.id === template
                )?.name
              }
            </p>

            <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
              {template}
            </span>

          </div>

        </div>

        {/* GENERATE */}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-lg font-semibold text-black transition hover:scale-[1.01] hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Generating Portfolio..."
            : "Generate Portfolio"}
        </button>

        {/* LOADING */}

        {loading && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-center">

            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-400" />

            <p className="mt-4 text-sm text-zinc-400">
              Creating your portfolio...
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Your selected theme and AI-generated
              resume data are being combined.
            </p>

          </div>
        )}

        {/* ERROR */}

        {result && (
          <div className="mt-6">

            <p className="mb-2 text-sm font-medium text-red-400">
              Generation Result
            </p>

            <pre className="max-h-96 overflow-auto rounded-xl border border-red-500/20 bg-black p-4 text-sm text-zinc-300">
              {result}
            </pre>

          </div>
        )}

        {/* PROCESS */}

        <div className="mt-12 grid gap-4 md:grid-cols-4">

          <ProcessStep
            number="01"
            title="Resume"
            description="Resume uploaded"
          />

          <ProcessStep
            number="02"
            title="AI Analysis"
            description="Resume structured"
          />

          <ProcessStep
            number="03"
            title="Theme"
            description={template}
            active
          />

          <ProcessStep
            number="04"
            title="Portfolio"
            description="Ready to publish"
          />

        </div>

      </div>
    </main>
  );
}

/* =====================================================
   THEME PREVIEW
===================================================== */

type ThemePreviewProps = {
  theme: TemplateId;
  selected: boolean;
};

function ThemePreview({
  theme,
  selected,
}: ThemePreviewProps) {
  if (theme === "modern") {
    return (
      <div className="h-64 bg-zinc-100 p-6 text-zinc-900">
        <div className="mx-auto max-w-sm">

          <div className="h-2 w-20 rounded bg-indigo-600" />

          <div className="mt-5 h-5 w-44 rounded bg-zinc-800" />

          <div className="mt-3 h-3 w-32 rounded bg-zinc-400" />

          <div className="mt-8 h-px w-full bg-zinc-300" />

          <div className="mt-7 grid grid-cols-3 gap-2">
            <div className="h-8 rounded bg-white shadow-sm" />
            <div className="h-8 rounded bg-white shadow-sm" />
            <div className="h-8 rounded bg-white shadow-sm" />
          </div>

          <div className="mt-4 h-16 rounded bg-white shadow-sm" />

        </div>
      </div>
    );
  }

  if (theme === "corporate") {
    return (
      <div className="h-64 bg-white p-6 text-slate-900">
        <div className="mx-auto max-w-sm">

          <div className="h-2 w-28 rounded bg-slate-700" />

          <div className="mt-6 h-6 w-48 rounded bg-slate-800" />

          <div className="mt-3 h-3 w-36 rounded bg-slate-300" />

          <div className="mt-8 grid grid-cols-2 gap-3">

            <div className="h-24 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="h-2 w-16 rounded bg-slate-400" />
              <div className="mt-3 h-2 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-2 w-14 rounded bg-slate-200" />
            </div>

            <div className="h-24 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="h-2 w-16 rounded bg-slate-400" />
              <div className="mt-3 h-2 w-20 rounded bg-slate-200" />
              <div className="mt-2 h-2 w-14 rounded bg-slate-200" />
            </div>

          </div>

        </div>
      </div>
    );
  }

  if (theme === "ai") {
    return (
      <div className="h-64 bg-black p-6 text-white">
        <div className="rounded-xl border border-cyan-500/20 bg-zinc-950 p-5">

          <div className="font-mono text-[10px] tracking-[0.3em] text-cyan-400">
            SYSTEM // PROFILE
          </div>

          <div className="mt-5 h-6 w-40 rounded bg-zinc-800" />

          <div className="mt-3 h-3 w-28 rounded bg-cyan-500/40" />

          <div className="mt-7 grid grid-cols-2 gap-2">
            <div className="h-7 rounded border border-cyan-500/20 bg-cyan-500/5" />
            <div className="h-7 rounded border border-cyan-500/20 bg-cyan-500/5" />
            <div className="h-7 rounded border border-cyan-500/20 bg-cyan-500/5" />
            <div className="h-7 rounded border border-cyan-500/20 bg-cyan-500/5" />
          </div>

        </div>
      </div>
    );
  }

  // Developer

  return (
    <div className="h-64 bg-black p-6 text-white">
      <div className="mx-auto max-w-sm">

        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">
          Portfolio
        </div>

        <div className="mt-5 h-7 w-48 rounded bg-zinc-800" />

        <div className="mt-3 h-4 w-32 rounded bg-cyan-500/30" />

        <div className="mt-8 h-px bg-zinc-800" />

        <div className="mt-7 space-y-3">
          <div className="h-12 rounded-xl border border-zinc-800 bg-zinc-950" />
          <div className="h-12 rounded-xl border border-zinc-800 bg-zinc-950" />
        </div>

      </div>
    </div>
  );
}

/* =====================================================
   PROCESS STEP
===================================================== */

type ProcessStepProps = {
  number: string;
  title: string;
  description: string;
  active?: boolean;
};

function ProcessStep({
  number,
  title,
  description,
  active = false,
}: ProcessStepProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        active
          ? "border-cyan-500/30 bg-cyan-500/5"
          : "border-zinc-800 bg-zinc-950"
      }`}
    >
      <p className="text-xs text-zinc-500">
        STEP {number}
      </p>

      <p className="mt-2 font-semibold">
        {title}
      </p>

      <p className="mt-1 text-sm capitalize text-zinc-500">
        {description}
      </p>
    </div>
  );
}