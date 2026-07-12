import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { jobText, oneTimeInstructions } = await request.json();

    if (!jobText || !jobText.trim()) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }

    const user = store.getUser() || {
      fullName: "Applicant",
      email: "applicant@example.com",
      title: "Candidate",
      skills: "",
      summary: "",
      projects: ""
    };

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_BACKUP_API_KEY;

    let parsedResult = {
      company: "Unknown Company",
      role: "Unknown Role",
      contactEmail: "hr@example.com",
      subject: "Application for Job Opportunity",
      emailBody: `Hello Hiring Team,\n\nI am excited to express my interest in your job listing. Based on my background as a ${user.title || 'professional'}, I believe I would be a great fit.\n\nBest regards,\n${user.fullName}`
    };

    if (apiKey) {
      try {
        const systemPrompt = `You are an AI Job Application Assistant.
We have the following candidate profile details:
- Full Name: ${user.fullName}
- Email: ${user.email}
- Title: ${user.title}
- Skills: ${user.skills}
- Summary: ${user.summary}
- Projects: ${user.projects}

Analyze the provided job description and:
1. Extract the "company" name (default: "Unknown Company").
2. Extract the job "role" or title (default: "Unknown Role").
3. Extract the "contactEmail" or recruiter email (default: "hr@example.com").
4. Write a tailored, persuasive email outreach draft from the candidate to the hiring team.
${oneTimeInstructions ? `Incorporate these specific instructions: "${oneTimeInstructions}"` : ""}

You MUST return strictly a JSON object with these exact keys:
- company (string)
- role (string)
- contactEmail (string)
- subject (string)
- emailBody (string)

Do not include any markdown formatting, extra conversational filler, or wrap the JSON in backticks.`;

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
              { role: "user", content: `Here is the job description:\n\n${jobText}` }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          const parsed = JSON.parse(content);
          if (parsed.company) parsedResult.company = parsed.company;
          if (parsed.role) parsedResult.role = parsed.role;
          if (parsed.contactEmail) parsedResult.contactEmail = parsed.contactEmail;
          if (parsed.subject) parsedResult.subject = parsed.subject;
          if (parsed.emailBody) parsedResult.emailBody = parsed.emailBody;
        }
      } catch (err) {
        console.error("Failed to parse via Groq, falling back to templates:", err);
      }
    } else {
      // Fallback simple parsing when no API key is present
      const lines = jobText.split("\n");
      for (const line of lines) {
        if (/email|contact|apply/i.test(line) && line.includes("@")) {
          const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) parsedResult.contactEmail = emailMatch[0];
        }
        if (/company|at /i.test(line) && parsedResult.company === "Unknown Company") {
          const parts = line.split(/company|at /i);
          if (parts[1]) parsedResult.company = parts[1].trim().split(" ")[0];
        }
      }
    }

    // Save the application and customize the draft in store
    const createdApp = store.createApplication({
      company: parsedResult.company,
      role: parsedResult.role,
      contactEmail: parsedResult.contactEmail,
      source: "text-pasted"
    });

    const draft = store.getDraftByApplication(createdApp.id);
    if (draft) {
      draft.subject = parsedResult.subject;
      draft.body = parsedResult.emailBody;
    }

    return NextResponse.json({
      application: createdApp,
      draft: draft
    }, { status: 201 });

  } catch (error) {
    console.error("Parse job API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
