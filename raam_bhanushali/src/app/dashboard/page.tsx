import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BriefcaseBusiness, Check, Eye, Gauge, Plus, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import PortfolioGrid, { type DashboardPortfolio } from "@/components/dashboard/PortfolioGrid";
import LogoutButton from "@/components/dashboard/LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/api/auth/signin");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/api/auth/signin");

  const totalPortfolios = await prisma.portfolio.count({ where: { userId: user.id } });
  const totalViews = await prisma.portfolioView.count({ where: { portfolio: { userId: user.id } } });
  const publishedPortfolios = await prisma.portfolio.count({ where: { userId: user.id, published: true } });
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, template: true, published: true, createdAt: true, _count: { select: { views: true } } },
  });

  const dashboardPortfolios: DashboardPortfolio[] = portfolios.map((portfolio) => ({
    id: portfolio.id,
    title: portfolio.title,
    slug: portfolio.slug,
    template: portfolio.template,
    published: portfolio.published,
    createdAt: portfolio.createdAt.toISOString(),
    views: portfolio._count.views,
  }));

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="min-w-0"><p className="text-lg font-semibold tracking-tight">ResumeForge</p><p className="hidden text-[11px] text-zinc-500 sm:block">AI Portfolio Builder</p></Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-500 md:flex"><Link href="/dashboard" className="text-zinc-100">Dashboard</Link><Link href="/dashboard" className="transition hover:text-zinc-200">My Portfolios</Link><Link href="/dashboard/analytics" className="transition hover:text-zinc-200">Analytics</Link></nav>
          <div className="flex items-center gap-3"><span className="hidden max-w-44 truncate text-sm text-zinc-400 sm:block">{session.user.email}</span><div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-sm font-semibold text-cyan-300">{session.user.email.charAt(0).toUpperCase()}</div><LogoutButton /></div>
        </div>
      </header>

      <section className="relative mx-auto max-w-[1400px] overflow-hidden px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <div className="pointer-events-none absolute -left-20 top-4 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" /><div className="pointer-events-none absolute right-10 top-0 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold tracking-[0.22em] text-cyan-400">RESUMEFORGE AI</p><h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Welcome back <span className="text-cyan-300">👋</span></h2><p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">Turn your resume into a professional portfolio and track how people interact with your work.</p></div><div className="flex flex-wrap gap-3"><Link href="/dashboard/upload" className="inline-flex items-center rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"><Plus className="mr-2 h-4 w-4" />Create Portfolio</Link><Link href="/dashboard/analytics" className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-cyan-400/50 hover:text-cyan-300"><BarChart3 className="mr-2 h-4 w-4" />View Analytics</Link></div></div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-12 sm:px-8"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BriefcaseBusiness className="h-5 w-5 text-cyan-400" />} label="Total Portfolios" value={totalPortfolios} />
        <StatCard icon={<Eye className="h-5 w-5 text-blue-400" />} label="Total Views" value={totalViews} />
        <StatCard icon={<Check className="h-5 w-5 text-emerald-400" />} label="Published" value={publishedPortfolios} />
        <StatCard icon={<Gauge className="h-5 w-5 text-purple-400" />} label="Resume Score" value="92%" accent />
      </div></section>

      <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><h2 className="text-2xl font-semibold tracking-tight">My Portfolios</h2><p className="mt-2 text-sm text-zinc-500">Manage, edit, preview, and customize your generated portfolios.</p></div><Link href="/dashboard/upload" className="mt-4 inline-flex items-center self-start rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 md:mt-0"><Plus className="mr-2 h-4 w-4" />Create New Portfolio</Link></div>
        {portfolios.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-12 text-center"><Sparkles className="mx-auto h-8 w-8 text-cyan-400" /><h3 className="mt-4 text-xl font-semibold">No portfolios yet</h3><p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">Upload your resume and let ResumeForge create your first portfolio.</p><Link href="/dashboard/upload" className="mt-6 inline-flex items-center rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"><Plus className="mr-2 h-4 w-4" />Create Your First Portfolio</Link></div> : <PortfolioGrid portfolios={dashboardPortfolios} />}
      </section>
    </main>
  );
}

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: number | string; accent?: boolean }) {
  return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-cyan-500/30"><div>{icon}</div><p className="mt-5 text-xs text-zinc-500">{label}</p><h3 className={`mt-2 text-3xl font-semibold ${accent ? "text-cyan-300" : "text-zinc-100"}`}>{value}</h3></div>;
}
