"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Eye,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Search,
  Sparkles,
} from "lucide-react";
import { getPortfolioUrl } from "@/lib/site-url";

export type DashboardPortfolio = {
  id: string;
  title: string;
  slug: string;
  template: string;
  published: boolean;
  createdAt: string;
  views: number;
};

type PortfolioGridProps = { portfolios: DashboardPortfolio[] };
const filters = ["All", "Developer", "Modern", "Corporate", "AI Neon", "Draft", "Published"] as const;
type Filter = (typeof filters)[number];

function templateKey(template: string) {
  return template.toLowerCase().replace(/[^a-z]/g, "");
}

function ThemePreview({ template }: { template: string }) {
  const key = templateKey(template);
  const isDeveloper = key.includes("developer");
  const isCorporate = key.includes("corporate");
  const isAi = key.includes("ai") || key.includes("neon");
  const surface = isDeveloper || isAi ? "border-cyan-400/20 bg-zinc-950" : isCorporate ? "border-blue-900/20 bg-white" : "border-zinc-200/10 bg-zinc-800";
  const accent = isCorporate ? "bg-blue-900" : "bg-cyan-400";
  const bar = isCorporate ? "bg-blue-950/80" : "bg-zinc-200/80";

  return (
    <div className={`relative h-[116px] overflow-hidden rounded-xl border p-4 ${surface}`}>
      <div className={`absolute -right-8 -top-10 h-28 w-28 rounded-full blur-3xl ${isAi ? "bg-cyan-400/25" : isCorporate ? "bg-blue-500/10" : "bg-cyan-400/10"}`} />
      <div className="relative flex h-full gap-3"><div className={`w-1 rounded-full ${accent}`} /><div className="flex-1 space-y-2.5 pt-1"><div className={`h-2.5 w-28 rounded-full ${bar}`} /><div className={`h-1.5 w-20 rounded-full ${isCorporate ? "bg-blue-900/20" : "bg-zinc-400/40"}`} /><div className="grid grid-cols-3 gap-1.5 pt-2"><span className={`h-8 rounded ${isAi ? "bg-cyan-400/20" : isCorporate ? "bg-blue-950/10" : "bg-white/10"}`} /><span className={`h-8 rounded ${isAi ? "bg-cyan-400/10" : isCorporate ? "bg-blue-950/10" : "bg-white/10"}`} /><span className={`h-8 rounded ${isAi ? "bg-cyan-400/20" : isCorporate ? "bg-blue-950/10" : "bg-white/10"}`} /></div></div></div>
    </div>
  );
}

function TemplateIcon({ template }: { template: string }) {
  const key = templateKey(template);
  if (key.includes("developer")) return <Code2 className="h-4 w-4" />;
  if (key.includes("ai") || key.includes("neon")) return <Sparkles className="h-4 w-4" />;
  if (key.includes("corporate")) return <FileText className="h-4 w-4" />;
  return <LayoutTemplate className="h-4 w-4" />;
}

function formatUpdatedDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export default function PortfolioGrid({ portfolios }: PortfolioGridProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const visiblePortfolios = useMemo(() => portfolios.filter((portfolio) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [portfolio.title, portfolio.slug, portfolio.template].some((value) => value.toLowerCase().includes(normalizedQuery));
    const key = templateKey(portfolio.template);
    const matchesFilter = activeFilter === "All" || (activeFilter === "Draft" && !portfolio.published) || (activeFilter === "Published" && portfolio.published) || (activeFilter === "Developer" && key.includes("developer")) || (activeFilter === "Modern" && key.includes("modern")) || (activeFilter === "Corporate" && key.includes("corporate")) || (activeFilter === "AI Neon" && (key.includes("ai") || key.includes("neon")));
    return matchesQuery && matchesFilter;
  }), [activeFilter, portfolios, query]);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search portfolios..." className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10" /></label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Portfolio filters">{filters.map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${activeFilter === filter ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"}`}>{filter}</button>)}</div>
      </div>
      {visiblePortfolios.length === 0 ? <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-12 text-center"><p className="text-sm text-zinc-500">No portfolios match your search or filter.</p></div> : <div className="mt-6 grid gap-5 md:grid-cols-2">{visiblePortfolios.map((portfolio) => <PortfolioCard key={portfolio.id} portfolio={portfolio} />)}</div>}
    </div>
  );
}

function PortfolioCard({ portfolio }: { portfolio: DashboardPortfolio }) {
  return (
    <article className="group rounded-2xl border border-zinc-800 bg-zinc-950/75 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-[0_16px_50px_rgba(8,145,178,0.08)] sm:p-5">
      <ThemePreview template={portfolio.template} />
      <div className="mt-5 flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-semibold text-zinc-100">{portfolio.title}</h3><p className="mt-1 truncate text-sm text-zinc-500">/portfolio/{portfolio.slug}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${portfolio.published ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>{portfolio.published ? "Published" : "Draft"}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-zinc-800 bg-black/40 p-3"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">Theme</p><p className="mt-2 flex items-center gap-2 text-sm font-medium capitalize text-zinc-300"><span className="text-cyan-400"><TemplateIcon template={portfolio.template} /></span>{portfolio.template}</p></div><div className="rounded-xl border border-zinc-800 bg-black/40 p-3"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">Views</p><p className="mt-2 flex items-center gap-2 text-sm font-medium text-cyan-300"><Eye className="h-4 w-4" />{portfolio.views}</p></div></div>
      <p className="mt-4 text-xs text-zinc-600">Updated {formatUpdatedDate(portfolio.createdAt)}</p>
      <div className="mt-5 flex items-center gap-2">{portfolio.published ? <Link href={`/portfolio/${portfolio.slug}`} className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-300"><Eye className="mr-2 h-3.5 w-3.5" />View Portfolio</Link> : <Link href={`/dashboard/editor/${portfolio.id}`} className="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-400 px-3 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-amber-300"><Pencil className="mr-2 h-3.5 w-3.5" />Edit Draft</Link>}<PortfolioMenu id={portfolio.id} slug={portfolio.slug} /></div>
    </article>
  );
}

function PortfolioMenu({ id, slug }: { id: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const portfolioHref = `/portfolio/${slug}`;
  async function handleCopy() { await navigator.clipboard.writeText(getPortfolioUrl(slug)); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  return <div className="relative"><button type="button" aria-label="Portfolio actions" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-200"><MoreHorizontal className="h-4 w-4" /></button>{open && <div className="absolute bottom-12 right-0 z-10 w-40 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl"><Link href={portfolioHref} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">View Portfolio</Link><Link href={`/dashboard/editor/${id}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800">Edit Portfolio</Link><button type="button" onClick={handleCopy} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800">{copied ? "Copied" : "Copy Link"}{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}</button></div>}</div>;
}
