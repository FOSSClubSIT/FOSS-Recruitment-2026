import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeWithOllama } from "@/lib/ollama/parser";
import { validatePortfolioData } from "@/lib/ollama/validate";
import { repairPortfolioData } from "@/lib/ollama/repair";
import { getPortfolioUrl } from "@/lib/site-url";
import type { RawPortfolioData } from "@/types/portfolio";

const VALID_TEMPLATES = [
  "developer",
  "modern",
  "corporate",
  "ai",
] as const;

type PortfolioTemplate =
  (typeof VALID_TEMPLATES)[number];

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Authentication
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. Find logged-in user
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 3. Read and validate template
    // --------------------------------------------------

    let template: PortfolioTemplate =
      "developer";

    try {
      const body: unknown =
        await request.json();

      if (isRecord(body)) {
        const requestedTemplate =
          body.template;

        if (
          typeof requestedTemplate ===
            "string" &&
          VALID_TEMPLATES.includes(
            requestedTemplate as PortfolioTemplate
          )
        ) {
          template =
            requestedTemplate as PortfolioTemplate;
        }
      }
    } catch {
      // Keep developer as fallback.
    }

    // --------------------------------------------------
    // 4. Find latest resume belonging to THIS user
    // --------------------------------------------------

    const resume =
      await prisma.resume.findFirst({
        where: {
          userId: user.id,
          parsedData: {
            not: Prisma.JsonNull,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No parsed resume found. Please upload and analyze your resume first.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Get existing parsed data
    // --------------------------------------------------

    let parsedData: RawPortfolioData =
      isRecord(resume.parsedData)
        ? (resume.parsedData as RawPortfolioData)
        : {};

    // --------------------------------------------------
    // 6. Ensure professionalProfile exists
    // --------------------------------------------------

    const professionalProfile =
      parsedData.professionalProfile;

    const hasProfessionalProfile =
      isRecord(professionalProfile) &&
      typeof professionalProfile.title ===
        "string" &&
      professionalProfile.title.trim() !== "";

    if (
      !hasProfessionalProfile &&
      resume.extractedText
    ) {
      console.log(
        "[generate-portfolio] professionalProfile missing."
      );

      console.log(
        "[generate-portfolio] Re-running AI analysis..."
      );

      const aiResponse =
        await parseResumeWithOllama(
          resume.extractedText
        );

      try {
        const reparsed: unknown =
          JSON.parse(aiResponse);

        if (isRecord(reparsed)) {
          parsedData =
            reparsed as RawPortfolioData;
        } else {
          return NextResponse.json(
            {
              success: false,
              error:
                "AI returned invalid resume JSON.",
            },
            { status: 500 }
          );
        }
      } catch {
        console.error(
          "[generate-portfolio] Invalid AI JSON:",
          aiResponse
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "AI returned invalid resume JSON.",
          },
          { status: 500 }
        );
      }
    }

    // --------------------------------------------------
    // 7. Validate + repair AI data
    // --------------------------------------------------

    const portfolioData =
      repairPortfolioData(
        validatePortfolioData(parsedData)
      );

    console.log(
      "========== PROFESSIONAL PROFILE =========="
    );

    console.log(
      JSON.stringify(
        portfolioData.professionalProfile,
        null,
        2
      )
    );

    // --------------------------------------------------
    // 8. Determine candidate name
    // --------------------------------------------------

    const personalInfo =
      isRecord(parsedData.personalInfo)
        ? parsedData.personalInfo
        : {};

    const personal =
      isRecord(parsedData.personal)
        ? parsedData.personal
        : {};

    const getString = (
      value: unknown
    ): string => {
      return typeof value === "string"
        ? value.trim()
        : "";
    };

    const fullName =
      getString(
        portfolioData.personalInfo?.fullName
      ) ||
      getString(personalInfo.fullName) ||
      getString(personalInfo.full_name) ||
      getString(personalInfo.name) ||
      getString(
        personalInfo.candidateName
      ) ||
      getString(personal.fullName) ||
      getString(personal.full_name) ||
      getString(personal.name) ||
      getString(
        personal.candidateName
      ) ||
      "My Portfolio";

    // --------------------------------------------------
    // 9. Generate unique slug
    // --------------------------------------------------

    const baseSlug =
      fullName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      `portfolio-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.portfolio.findUnique({
        where: {
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // --------------------------------------------------
    // 10. Create portfolio for CURRENT USER
    // --------------------------------------------------

    const portfolio =
      await prisma.portfolio.create({
        data: {
          title:
            `${fullName} - Portfolio`,
          slug,
          template,
          data: JSON.parse(
            JSON.stringify(portfolioData)
          ),
          published: true,
          userId: user.id,
        },
      });

    // --------------------------------------------------
    // 11. Return result
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Portfolio generated successfully.",

      portfolio: {
        id: portfolio.id,
        title: portfolio.title,
        slug: portfolio.slug,
        template: portfolio.template,
        published: portfolio.published,
        url: getPortfolioUrl(portfolio.slug),
      },

      professionalProfile:
        portfolioData.professionalProfile,
    });
  } catch (error) {
    console.error(
      "Portfolio generation failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Portfolio generation failed.",
      },
      { status: 500 }
    );
  }
}