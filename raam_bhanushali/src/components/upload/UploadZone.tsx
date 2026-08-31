"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export default function UploadZone({
  onFileSelect,
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
    });

  return (
    <div
      {...getRootProps()}
      className={`
        rounded-3xl
        border-2
        border-dashed
        transition
        cursor-pointer
        p-14
        text-center

        ${
          isDragActive
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-zinc-700 hover:border-cyan-500"
        }
      `}
    >
      <input {...getInputProps()} />

      <UploadCloud
        size={60}
        className="mx-auto text-cyan-400"
      />

      <h2 className="mt-6 text-2xl font-bold">
        Drag & Drop Resume
      </h2>

      <p className="mt-3 text-zinc-400">
        or click to browse
      </p>

      <div className="mt-6 flex justify-center gap-2 text-sm text-zinc-500">
        <FileText size={18} />
        PDF / DOCX • Max 10 MB
      </div>
    </div>
  );
}