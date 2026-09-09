export async function parseSkillsWithOllama(
  resumeText: string
) {
  const response = await fetch(
    "http://localhost:11434/api/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        stream: false,
        prompt: `
Extract ALL technical skills from the resume.

Return ONLY valid JSON.

Format:

[
  {
    "name": "React",
    "category": "Frontend"
  }
]

Categories allowed:

- Frontend
- Backend
- Database
- AI/ML
- Cloud
- DevOps
- Mobile
- Programming Language
- Tools
- Other

Resume:

${resumeText}
`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status}`
    );
  }

  const result = await response.json();

  try {
    return JSON.parse(
      result.response
    );
  } catch {
    return [];
  }
}