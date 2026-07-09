export type ApplicationStatus = "pending" | "drafted" | "sent" | "replied";

export interface UserProfile {
  fullName: string;
  email: string;
  title: string;
  skills: string;
  summary: string;
  resumeName?: string;
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
  id: number;
  company: string;
  role: string;
  source: string;
  contactEmail: string;
  status: ApplicationStatus;
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
