import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseResume } from "@/lib/parser/resume-parser";

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // 1. Check authentication
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
    // 2. Find current user
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
    // 3. Get resume ID
    // -----------------------------------------

    const body = await request.json();

    const resumeId = body.resumeId;

    if (!resumeId) {
      return NextResponse.json(
        {
          success: false,
          error: "resumeId is required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 4. Find ONLY this user's resume
    // -----------------------------------------

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    if (!resume) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume not found or does not belong to the current user.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 5. Mark as parsing
    // -----------------------------------------

    await prisma.resume.update({
      where: {
        id: resume.id,
      },
      data: {
        status: "PARSING",
      },
    });

    try {
      // -----------------------------------------
      // 6. Read uploaded file
      // -----------------------------------------

      if (!/^https?:\/\//i.test(resume.filePath)) {
        throw new Error("Resume file is not stored in remote storage.");
      }

      const fileResponse = await fetch(resume.filePath);
      if (!fileResponse.ok) {
        throw new Error(`Resume download failed (${fileResponse.status}).`);
      }

      const buffer = Buffer.from(await fileResponse.arrayBuffer());

      // -----------------------------------------
      // 8. Extract resume text
      // -----------------------------------------

      const resumeText = await parseResume(buffer, resume.fileType);

      if (!resumeText.trim()) {
        throw new Error(
          "No text could be extracted from the resume."
        );
      }

      // -----------------------------------------
      // 9. Save extracted text
      // -----------------------------------------

      const updatedResume =
        await prisma.resume.update({
          where: {
            id: resume.id,
          },
          data: {
            extractedText: resumeText,
            status: "PARSED",
          },
        });

      return NextResponse.json({
        success: true,
        message: "Resume parsed successfully.",
        resumeId: updatedResume.id,
        userId: user.id,
        status: updatedResume.status,
        extractedTextLength:
          resumeText.length,
      });
    } catch (parseError) {
      console.error(
        "Resume extraction failed:",
        parseError
      );

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
            parseError instanceof Error
              ? parseError.message
              : "Resume extraction failed.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      "Parse resume API error:",
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