import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
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
  if (!user || !user.gmailRefreshToken) {
    throw new Error("Gmail Account is not connected. Please complete first-time Setup.");
  }

  const contactEmail = app.contactEmail || "hr@example.com";
  const cleanEmail = user.gmailAddress?.trim() || "";
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google Client ID or Secret is not configured on the server.");
  }

  // Explicitly fetch access token using google-auth-library
  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: user.gmailRefreshToken });
  
  let accessToken = "";
  try {
    const res = await oauth2Client.getAccessToken();
    accessToken = res?.token || "";
  } catch (err: any) {
    console.error("Failed to fetch access token:", err);
    throw new Error("Failed to authenticate with Google. You might need to reconnect your Gmail on the Setup page.");
  }

  // Configure transporter using OAuth2 with explicit access token
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: cleanEmail,
      clientId,
      clientSecret,
      refreshToken: user.gmailRefreshToken,
      accessToken,
    },
  });

  const mailOptions: any = {
    from: `"${user.fullName || 'Job Applicant'}" <${user.gmailAddress}>`,
    to: contactEmail,
    cc: draft.cc || [],
    subject: draft.subject || `Application for ${app.role}`,
    text: draft.body,
  };

  if (user.resumeBase64 && user.resumeFilename) {
    mailOptions.attachments = [
      {
        filename: user.resumeFilename,
        path: user.resumeBase64
      }
    ];
  }

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
