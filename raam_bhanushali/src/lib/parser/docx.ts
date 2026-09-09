import mammoth from "mammoth";

export async function parseDOCX(buffer: Buffer): Promise<string> {
  console.info(`[resume-parser] DOCX parser started (${buffer.length} bytes)`);

  try {
    const result = await mammoth.extractRawText({
      buffer,
    });
    const text = result.value.trim();

    if (result.messages.length > 0) {
      console.warn("[resume-parser] DOCX parser reported messages:", result.messages);
    }

    console.info(`[resume-parser] DOCX parser completed (${text.length} characters)`);
    return text;
  } catch (error) {
    console.error("[resume-parser] DOCX parsing failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse DOCX: ${message}`);
  }
}
