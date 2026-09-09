import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseResumeWithAI } from "@/lib/ai/resume-ai";

export async function GET() {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
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
          error: "No parsed resume with extracted text found.",
        },
        { status: 404 }
      );
    }

    const parsedResume = await parseResumeWithAI(
      resume.extractedText
    );

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      parsedResume,
    });
  } catch (error) {
    console.error("AI parser test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "AI parser failed.",
      },
      { status: 500 }
    );
  }
}