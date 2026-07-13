import nodemailer from "nodemailer";
import { store } from "./store";

export async function sendOutreachEmail(draftId: number): Promise<{ success: boolean; message: string }> {
  const draft = store.getDraft(draftId);
  if (!draft) {
    throw new Error("Draft not found.");
  }

  const app = store.getApplication(draft.applicationId);
  if (!app) {
    throw new Error("Associated job application not found.");
  }

  const user = store.getUser();
  if (!user || !user.gmailAddress || !user.gmailAppPassword) {
    throw new Error("Gmail Address and App Password are not configured. Please complete first-time Setup.");
  }

  const contactEmail = app.contactEmail || "hr@example.com";

    const cleanEmail = user.gmailAddress.trim();
    const cleanPassword = user.gmailAppPassword.replace(/\s+/g, '');

    // Configure transporter using the user's gmail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanEmail,
        pass: cleanPassword,
      },
  });

  const mailOptions = {
    from: `"${user.fullName || 'Job Applicant'}" <${user.gmailAddress}>`,
    to: contactEmail,
    cc: draft.cc || [],
    subject: draft.subject || `Application for ${app.role}`,
    text: draft.body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);
    
    // Mark draft as sent in store
    store.sendDraft(draftId);
    
    return { 
      success: true, 
      message: `Email successfully sent to ${contactEmail}.` 
    };
  } catch (error: any) {
    console.error("Nodemailer error: ", error);
    throw new Error(`Failed to send email: ${error.message || error}`);
  }
}
