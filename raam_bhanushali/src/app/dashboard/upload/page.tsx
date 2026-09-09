"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/upload/UploadZone";

export default function UploadResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const router = useRouter();

  function handleFile(selectedFile: File) {
    setFile(selectedFile);
    setStatus("");
  }

  async function uploadResume() {
    if (!file) {
      setStatus("Please select a resume first.");
      return;
    }

    setUploading(true);
    setStatus("Uploading resume...");

    try {
      // ==================================================
      // STEP 1 — Upload resume
      // ==================================================

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      console.log("Upload response:", uploadData);

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(
          uploadData.error || "Resume upload failed."
        );
      }

      // The upload API creates the Resume record.
      const resumeId = uploadData.resume?.id;

      if (!resumeId) {
        throw new Error(
          "Resume uploaded, but no resume ID was returned."
        );
      }

      console.log("Uploaded resume ID:", resumeId);

      // ==================================================
      // STEP 2 — Extract resume text
      // ==================================================

      setStatus(
        "Resume uploaded. Extracting resume content..."
      );

      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId,
        }),
      });

      const parseData = await parseResponse.json();

      console.log("Parse response:", parseData);

      if (!parseResponse.ok || !parseData.success) {
        throw new Error(
          parseData.error || "Resume parsing failed."
        );
      }

      // ==================================================
      // STEP 3 — AI parsing
      // ==================================================

      setStatus(
        "Resume extracted. AI is analyzing your resume..."
      );

      const aiResponse = await fetch(
        "/api/parse-resume-ai",
        {
          method: "POST",
        }
      );

      const aiData = await aiResponse.json();

      console.log("AI parsing response:", aiData);

      if (!aiResponse.ok || !aiData.success) {
        throw new Error(
          aiData.error ||
            "AI resume analysis failed."
        );
      }

      // ==================================================
      // STEP 4 — Success
      // ==================================================

      setStatus(
        "AI analysis complete! Redirecting..."
      );

      console.log(
        "AI parsed resume:",
        aiData.parsedResume
      );

      // Give the user a moment to see the success message.
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      router.push("/dashboard/generate");

    } catch (error) {
      console.error(
        "Resume processing error:",
        error
      );

      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing the resume."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            ResumeForge AI
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Upload Resume
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Upload your resume and let AI extract your
            experience, skills, projects, education,
            and professional information.
          </p>

        </div>

        {/* Upload Zone */}
        <div className="mt-10">
          <UploadZone
            onFileSelect={handleFile}
          />
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-7">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm text-zinc-500">
                  Selected Resume
                </p>

                <h3 className="mt-2 text-lg font-semibold">
                  {file.name}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

              </div>

              <button
                onClick={uploadResume}
                disabled={uploading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 font-semibold text-black transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Processing..."
                  : "Upload & Analyze"}
              </button>

            </div>

          </div>
        )}

        {/* Processing Status */}
        {status && (
          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

            <div className="flex items-center gap-4">

              {uploading && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-cyan-400" />
              )}

              {!uploading && status.includes("complete") && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  ✓
                </div>
              )}

              <p className="text-sm text-zinc-300">
                {status}
              </p>

            </div>

          </div>
        )}

        {/* Processing Steps */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

            <p className="text-xs font-semibold text-cyan-400">
              STEP 01
            </p>

            <h3 className="mt-2 font-semibold">
              Upload
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Securely upload your PDF or DOCX resume.
            </p>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

            <p className="text-xs font-semibold text-cyan-400">
              STEP 02
            </p>

            <h3 className="mt-2 font-semibold">
              Extract
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Resume content is extracted and structured.
            </p>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">

            <p className="text-xs font-semibold text-cyan-400">
              STEP 03
            </p>

            <h3 className="mt-2 font-semibold">
              AI Analysis
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Qwen analyzes your resume and creates
              structured portfolio data.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}