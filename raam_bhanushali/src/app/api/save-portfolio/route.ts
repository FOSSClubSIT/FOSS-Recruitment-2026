import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId, portfolioData } = body;

    const fullName =
      portfolioData?.personalInfo?.fullName ||
      "portfolio";

    const slug = fullName
      .toLowerCase()
      .replace(/\s+/g, "-");

    const portfolio =
      await prisma.portfolio.create({
        data: {
          title: `${fullName} Portfolio`,
          slug,
          data: portfolioData,
          userId,
        },
      });

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save portfolio",
      },
      {
        status: 500,
      }
    );
  }
}