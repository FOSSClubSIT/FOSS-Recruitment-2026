import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeWithAI } from "@/lib/ai/resume-ai";

export async function POST() {
  try {
    // -----------------------------------------
    // 1. Check logged-in user
    // -----------------------------------------

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

    // -----------------------------------------
    // 2. Find logged-in user
    // -----------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 3. Find ONLY this user's latest parsed resume
    // -----------------------------------------

    const resume = await prisma.resume.findFirst({
      where: {
        userId: user.id,
        status: "PARSED",
        extractedText: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!resume || !resume.extractedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No parsed resume found for the current user.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 4. Mark as AI parsing
    // -----------------------------------------

    await prisma.resume.update({
      where: {
        id: resume.id,
      },
      data: {
        status: "AI_PARSING",
      },
    });

    try {
      // -----------------------------------------
      // 5. Send THIS USER'S resume to Qwen
      // -----------------------------------------

      const parsedResume =
        await parseResumeWithAI(
          resume.extractedText
        );

      // -----------------------------------------
      // 6. Save AI result
      // -----------------------------------------

      const updatedResume =
        await prisma.resume.update({
          where: {
            id: resume.id,
          },
          data: {
            parsedData: JSON.parse(JSON.stringify(parsedResume)),
            status: "AI_PARSED",
          },
        });

      return NextResponse.json({
        success: true,
        message:
          "Resume parsed successfully with AI.",

        resumeId: updatedResume.id,

        userId: user.id,

        status: updatedResume.status,

        parsedResume:
          updatedResume.parsedData,
      });

    } catch (aiError) {
      console.error(
        "AI resume parsing failed:",
        aiError
      );

      // -----------------------------------------
      // 7. Mark this resume as failed
      // -----------------------------------------

      await prisma.resume.update({
        where: {
          id: resume.id,
        },
        data: {
          status: "FAILED",
        },
      });

      return NextResponse.json(
        {
          success: false,
          error:
            aiError instanceof Error
              ? aiError.message
              : "AI resume parsing failed.",
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(
      "Parse resume AI API failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      { status: 500 }
    );
  }
}
