import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();
    if (!resumeText) {
      return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured on server" }, { status: 500 });
    }

    const systemPrompt = `You are an expert resume parser. 
Extract the following information from the provided resume text and return it strictly as a JSON object with these exact keys:
- fullName (string)
- email (string)
- phone (string)
- title (string, e.g., 'Software Engineer')
- skills (string, a comma-separated list of technical skills)
- summary (string, a short bio or summary)
- projects (string, brief descriptions of key projects)

Do not return any markdown formatting or extra text. Only return the raw JSON object.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the resume:\n\n${resumeText}` }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json({ error: "Failed to parse resume from LLM" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Meta-prompt API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
