export type ApplicationStatus = "pending" | "drafted" | "sent" | "replied";

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  title: string;
  skills: string;
  summary: string;
  projects?: string;
  gmailAddress?: string;
  gmailRefreshToken?: string;
  resumeFilename?: string;
  resumeBase64?: string;
  systemPrompt?: string;
  groqApiKey?: string;
  hfToken?: string;
}

export interface Draft {
  id: number;
  applicationId: number;
  subject: string;
  body: string;
  starred: boolean;
  favorite: boolean;
  cc: string[];
  sent: boolean;
}

export interface JobApplication {
  id: string | number;
  company: string;
  role: string;
  source: string;
  contactEmail: string;
  mobileNumber?: string;
  jobDescription?: string;
  status: ApplicationStatus | string;
  createdAt: string;
}

export interface Reply {
  id: number;
  applicationId: number;
  classification: "Shortlisted" | "Neutral" | "Rejection";
  message: string;
}

export interface CampaignItem {
  id: number;
  name: string;
  email: string;
  status: "pending" | "sent" | "failed";
}

export interface Campaign {
  id: number;
  name: string;
  status: "running" | "paused" | "completed";
  sent: number;
  failed: number;
  total: number;
  items: CampaignItem[];
}
