import { InferenceClient } from "@huggingface/inference";

const MODEL = "Qwen/Qwen3-4B-Instruct-2507";

export async function generateWithHuggingFace(
  prompt: string
): Promise<string> {
  const token = process.env.HF_TOKEN;

  if (!token) {
    throw new Error("HF_TOKEN is not configured.");
  }

  const client = new InferenceClient(token);

  try {
    const response = await client.chatCompletion({
      model: MODEL,
      provider: "nscale",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 4000,
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Hugging Face returned an empty response.");
    }

    return content.trim();
  } catch (error) {
    console.error("Hugging Face AI request failed:", error);

    if (error instanceof Error) {
      throw new Error(
        `Hugging Face request failed: ${error.message}`
      );
    }

    throw new Error("Hugging Face request failed.");
  }
}