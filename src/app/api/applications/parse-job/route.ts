import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { jobText, oneTimeInstructions, userProfile } = await request.json();

    if (!jobText || !jobText.trim()) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }

    const user = userProfile || store.getUser() || {
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
      mobileNumber: "",
      subject: "Application for Job Opportunity",
      emailBody: `Hello Hiring Team,\n\nI am excited to express my interest in your job listing. Based on my background as a ${user.title || 'professional'}, I believe I would be a great fit.\n\nBest regards,\n${user.fullName}`
    };

    if (apiKey) {
      try {
        const systemPrompt = `You are an AI Job Application Assistant.
We have the following candidate profile details:
- Full Name: ${user.fullName}
- Email: ${user.email}
- Phone: ${user.phone || ''}
- Title: ${user.title}
- Skills: ${user.skills}
- Summary: ${user.summary}
- Projects: ${user.projects}

Analyze the provided job description and:
1. Extract the "company" name (default: "Unknown Company").
2. Extract the job "role" or title (default: "Unknown Role").
4. Extract the "contactEmail" or recruiter email (default: "hr@example.com").
5. Extract the "mobileNumber" if mentioned in the job description (default: "").
6. Write a tailored, persuasive email outreach draft from the candidate to the hiring team.
${oneTimeInstructions ? `Incorporate these specific instructions: "${oneTimeInstructions}"` : ""}

CRITICAL FORMATTING RULES FOR THE EMAIL BODY:
The emailBody MUST follow this exact structure:
- Salutation: "Dear Hiring Manager,"
- Paragraph 1: Express your excitement and interest in the specific role and company.
- Paragraph 2: Summarize your relevant experience, technical skills, and key projects that make you a great fit.
- Paragraph 3: Highlight your alignment with the company's goals, culture, or focus on innovation.
- Sign-off: MUST be exactly this format:
Best regards,
${user.fullName}
${user.phone || ''}
${user.email}

You MUST return strictly a JSON object with these exact keys:
- company (string)
- role (string)
- contactEmail (string)
- mobileNumber (string)
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
          if (parsed.mobileNumber) parsedResult.mobileNumber = parsed.mobileNumber;
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

    // Return the raw parsed data to the frontend so it can be saved in Supabase
    return NextResponse.json({
      parsedResult
    }, { status: 200 });

  } catch (error) {
    console.error("Parse job API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
