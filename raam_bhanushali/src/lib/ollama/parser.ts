import { PORTFOLIO_SYSTEM_PROMPT } from "./prompts";
import { generateWithHuggingFace } from "@/lib/ai/huggingface";

export async function parseResumeWithOllama(
  resumeText: string
) {
  if (!resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const prompt = `
${PORTFOLIO_SYSTEM_PROMPT}

IMPORTANT:

You MUST return the complete resume analysis as JSON.

The "professionalProfile" object is REQUIRED.

You MUST determine the professional profile from the complete resume.

Do not assume the candidate is a software engineer.

Do not use a generic "Professional" title when the resume clearly identifies a profession or specialization.

The professionalProfile must contain:

{
  "title": "",
  "domain": "",
  "specializations": [],
  "seniority": "",
  "evidence": []
}

The title, domain, specializations, seniority, and evidence must be based on information actually present in the resume.

Return ONLY the JSON object.

Do not return:
- reasoning
- thinking
- explanations
- markdown
- code fences
- text before or after the JSON

Resume Text:

${resumeText}
`;

  let response: string;

  // --------------------------------------------------
  // Production: Hugging Face / Nscale
  // Local development: Ollama
  // --------------------------------------------------

  if (process.env.VERCEL === "1") {
    console.log(
      "[portfolio-parser] Using Hugging Face / Nscale"
    );

    response = await generateWithHuggingFace(prompt);
  } else {
    console.log(
      "[portfolio-parser] Using local Ollama"
    );

    const ollamaResponse = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3:4b",
          stream: false,
          think: false,
          format: "json",
          prompt,
        }),
      }
    );

    if (!ollamaResponse.ok) {
      throw new Error(
        `Ollama request failed: ${ollamaResponse.status}`
      );
    }

    const result = await ollamaResponse.json();

    console.log(
      "[ollama] response:",
      result.response
    );

    if (!result.response) {
      throw new Error(
        "Ollama returned an empty response."
      );
    }

    response = result.response;
  }

  return response;
}