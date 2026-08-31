import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { PortfolioData } from "@/types/portfolio";
import type { RawPortfolioData } from "@/types/portfolio";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function currentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const portfolio = await prisma.portfolio.findFirst({ where: { id, userId: user.id }, select: { id: true, title: true, slug: true, template: true, published: true, data: true } });
    if (!portfolio) return NextResponse.json({ success: false, error: "Portfolio not found." }, { status: 404 });
    return NextResponse.json({ success: true, portfolio: { ...portfolio, data: portfolio.data as RawPortfolioData } });
  } catch (error) {
    console.error("Portfolio fetch failed:", error);
    return NextResponse.json({ success: false, error: "Portfolio fetch failed." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    // --------------------------------------------
    // 1. Authentication
    // --------------------------------------------

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------
    // 2. Get logged-in user
    // --------------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------
    // 3. Get portfolio ID
    // --------------------------------------------

    const { id } = await params;

    // --------------------------------------------
    // 4. Find portfolio belonging to user
    // --------------------------------------------

    const portfolio =
      await prisma.portfolio.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

    if (!portfolio) {
      return NextResponse.json(
        {
          success: false,
          error: "Portfolio not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------
    // 5. Read request body
    // --------------------------------------------

    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return NextResponse.json({ success: false, error: "A JSON object is required." }, { status: 400 });
    }

    const portfolioData =
      body.data as PortfolioData | undefined;

    if (!portfolioData) {
      return NextResponse.json(
        {
          success: false,
          error: "Portfolio data is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------
    // 6. Optional template update
    // --------------------------------------------

    const template =
      typeof body?.template === "string" &&
      body.template.trim()
        ? body.template.trim()
        : portfolio.template;

    // --------------------------------------------
    // 7. Update portfolio
    // --------------------------------------------

    const published = typeof body.published === "boolean" ? body.published : portfolio.published;

    const updatedPortfolio =
      await prisma.portfolio.update({
        where: {
          id: portfolio.id,
        },
        data: {
          data: JSON.parse(
            JSON.stringify(portfolioData)
          ),
          template,
          published,
        },
      });

    // --------------------------------------------
    // 8. Return result
    // --------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Portfolio updated successfully.",
      portfolio: {
        id: updatedPortfolio.id,
        title: updatedPortfolio.title,
        slug: updatedPortfolio.slug,
        template:
          updatedPortfolio.template,
        published: updatedPortfolio.published,
      },
    });
  } catch (error) {
    console.error(
      "Portfolio update failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Portfolio update failed.",
      },
      { status: 500 }
    );
  }
}
