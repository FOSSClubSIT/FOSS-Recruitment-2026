import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeText(
  file: File
): Promise<string> {
  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  // PDF
  if (file.type === "application/pdf") {
    const result = await pdfParse(buffer);

    const text = result.text?.trim() || "";

    if (!text) {
      throw new Error(
        "No text could be extracted from the PDF."
      );
    }

    return text;
  }

  // DOCX
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result =
      await mammoth.extractRawText({
        buffer,
      });

    const text = result.value?.trim() || "";

    if (!text) {
      throw new Error(
        "No text could be extracted from the DOCX file."
      );
    }

    return text;
  }

  throw new Error(
    "Unsupported resume format. Please upload a PDF or DOCX file."
  );
}