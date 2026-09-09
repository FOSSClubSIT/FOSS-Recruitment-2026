import { NextResponse } from "next/server";
import { generateWithOllama } from "@/lib/ai/ollama";

export async function GET() {
  try {
    const response = await generateWithOllama(
      'Return ONLY this JSON: {"status":"working","model":"qwen3:4b"}'
    );

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Ollama test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ollama test failed",
      },
      { status: 500 }
    );
  }
}