"use client";

import { useEffect } from "react";

export default function VisitorTracker({ slug }: { slug: string }) {
  useEffect(() => {
    void fetch(`/api/portfolio/${encodeURIComponent(slug)}/view`, { method: "POST" });
  }, [slug]);
  return null;
}
