import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PortfolioRenderer from "@/components/portfolio/PortfolioRenderer";
import VisitorTracker from "@/components/portfolio/VisitorTracker";
import type { ThemeData } from "@/components/portfolio/themes/theme-types";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await prisma.portfolio.findFirst({ where: { slug, published: true } });
  if (!portfolio) notFound();
  return <><VisitorTracker slug={slug} /><PortfolioRenderer template={portfolio.template} data={portfolio.data as unknown as ThemeData} /></>;
}
