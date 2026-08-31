import { parsePDF } from "./pdf";
import { parseDOCX } from "./docx";

export async function parseResume(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  console.info(`[resume-parser] parseResume called for file type: ${fileType}`);

  try {
    switch (fileType) {
      case "application/pdf":
        return await parsePDF(buffer);

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await parseDOCX(buffer);

      case "application/msword":
        throw new Error(
          "Legacy .doc files are not supported yet. Please upload a .docx or PDF."
        );

      default:
        throw new Error(`Unsupported file type: ${fileType || "missing"}`);
    }
  } catch (error) {
    console.error(`[resume-parser] parseResume failed for ${fileType}:`, error);
    throw error instanceof Error
      ? error
      : new Error(`Resume parsing failed: ${String(error)}`);
  }
}
