declare module "pdf-parse" {
  type PdfParseResult = {
    text: string;
    numpages?: number;
    numrender?: number;
    info?: Record<string, unknown>;
    metadata?: Record<string, unknown> | null;
    version?: string;
  };

  type PdfParse = (
    dataBuffer: Buffer,
    options?: Record<string, unknown>
  ) => Promise<PdfParseResult>;

  const pdfParse: PdfParse;
  export default pdfParse;
}
