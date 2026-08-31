import pdfParse from "pdf-parse";

export async function parsePDF(
  buffer: Buffer
): Promise<string> {
  console.info(
    `[resume-parser] PDF parser started (${buffer.length} bytes)`
  );

  try {
    const data = await pdfParse(buffer);

    const text = data.text?.trim() || "";

    console.info(
      `[resume-parser] PDF text extracted (${text.length} characters)`
    );

    if (!text) {
      throw new Error(
        "No text could be extracted from the PDF."
      );
    }

    return text;
  } catch (error) {
    console.error(
      "[resume-parser] PDF parsing failed:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to parse PDF."
    );
  }
}