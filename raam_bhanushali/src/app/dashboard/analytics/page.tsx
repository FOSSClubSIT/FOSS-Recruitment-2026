import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AnalyticsChart from "@/components/AnalyticsChart";
import { getViewsLast7Days } from "@/lib/analytics";

export default async function AnalyticsPage() {
  // --------------------------------------------------
  // 1. Get current logged-in user
  // --------------------------------------------------

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // --------------------------------------------------
  // 2. Find current user
  // --------------------------------------------------

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/api/auth/signin");
  }

  // --------------------------------------------------
  // 3. Get ONLY this user's portfolios
  // --------------------------------------------------

  const portfolios =
    await prisma.portfolio.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

  // --------------------------------------------------
  // 4. Total views for current user's portfolios
  // --------------------------------------------------

  const totalViews = portfolios.reduce(
    (total, portfolio) =>
      total + portfolio._count.views,
    0
  );

  // --------------------------------------------------
  // 5. Portfolio with highest views
  // --------------------------------------------------

  const topPortfolio =
    portfolios.length > 0
      ? [...portfolios].sort(
          (a, b) =>
            b._count.views -
            a._count.views
        )[0]
      : null;

  // --------------------------------------------------
  // 6. Last 7 days
  // --------------------------------------------------

  const viewsLast7Days =
    await getViewsLast7Days(user.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* HEADER */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
            ResumeForge AI
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="mt-3 text-zinc-400">
            Track how people are interacting with
            your portfolio.
          </p>
        </div>

        {/* USER */}

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Account
          </p>

          <p className="mt-2 text-lg font-semibold">
            {user.name || user.email}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {user.email}
          </p>
        </div>

        {/* STAT CARDS */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Portfolio Views
            </p>

            <p className="mt-3 text-4xl font-bold text-cyan-400">
              {totalViews}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Across your portfolios
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Your Portfolios
            </p>

            <p className="mt-3 text-4xl font-bold">
              {portfolios.length}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              Total generated portfolios
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">
              Most Viewed
            </p>

            <p className="mt-3 truncate text-xl font-bold">
              {topPortfolio
                ? topPortfolio.title
                : "No portfolio yet"}
            </p>

            <p className="mt-2 text-xs text-zinc-600">
              {topPortfolio
                ? `${topPortfolio._count.views} views`
                : "Generate a portfolio first"}
            </p>
          </div>

        </div>

        {/* CHART */}

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Portfolio Views Trend
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Views across your portfolios during
              the last 7 days.
            </p>
          </div>

          <AnalyticsChart
            data={viewsLast7Days}
          />

        </section>

        {/* PORTFOLIOS */}

        <section className="mt-8">

          <h2 className="text-xl font-semibold">
            Your Portfolios
          </h2>

          <div className="mt-5 space-y-4">

            {portfolios.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
                <p className="text-zinc-400">
                  You haven't generated a portfolio yet.
                </p>
              </div>
            ) : (
              portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 md:flex-row md:items-center"
                >

                  <div>
                    <h3 className="font-semibold">
                      {portfolio.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      /portfolio/{portfolio.slug}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        portfolio.published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {portfolio.published
                        ? "Published"
                        : "Draft"}
                    </span>

                    <span className="text-sm text-zinc-400">
                      {portfolio._count.views} views
                    </span>

                  </div>

                </div>
              ))
            )}

          </div>

        </section>

      </div>
    </main>
  );
}