import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "portfolio_visitor_id";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return Response.json(
        { success: false, error: "Slug is required." },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!portfolio) {
      return Response.json(
        { success: false, error: "Portfolio not found." },
        { status: 404 }
      );
    }

    const cookieStore = await cookies();
    const existingVisitor = cookieStore.get(VISITOR_COOKIE)?.value;
    const visitorId = existingVisitor ?? crypto.randomUUID();

    await prisma.portfolioView.create({
      data: {
        portfolioId: portfolio.id,
        visitorId,
      },
    });

    if (!existingVisitor) {
      cookieStore.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Portfolio view tracking failed:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to record portfolio view.",
      },
      { status: 500 }
    );
  }
}