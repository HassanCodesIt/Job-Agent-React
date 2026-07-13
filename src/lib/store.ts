import { Campaign, Draft, JobApplication, Reply, UserProfile } from "@/lib/types";

let user: UserProfile | null = null;
let nextAppId = 2;
let nextDraftId = 2;
let nextCampaignId = 2;

const applications: JobApplication[] = [
  {
    id: 1,
    company: "Acme Labs",
    role: "Frontend Engineer",
    source: "job-url",
    contactEmail: "hiring@acme.dev",
    status: "drafted",
    createdAt: new Date().toISOString(),
  },
];

const drafts: Draft[] = [
  {
    id: 1,
    applicationId: 1,
    subject: "Application for Frontend Engineer",
    body: "Hi team, I would love to apply for the Frontend Engineer role.",
    starred: false,
    favorite: false,
    cc: [],
    sent: false,
  },
];

const replies: Reply[] = [];

const campaigns: Campaign[] = [
  {
    id: 1,
    name: "Sample Outreach Campaign",
    status: "running",
    sent: 1,
    failed: 0,
    total: 2,
    items: [
      { id: 1, name: "Recruiter One", email: "r1@example.com", status: "sent" },
      { id: 2, name: "Recruiter Two", email: "r2@example.com", status: "pending" },
    ],
  },
];

function buildDraft(applicationId: number, company: string, role: string): Draft {
  return {
    id: nextDraftId++,
    applicationId,
    subject: `Application for ${role}`,
    body: `Hello ${company} team,\n\nI am excited to apply for the ${role} role.`,
    starred: false,
    favorite: false,
    cc: [],
    sent: false,
  };
}

export const store = {
  getUser: () => user,
  setUser: (profile: Partial<UserProfile>) => {
    user = {
      fullName: profile.fullName ?? user?.fullName ?? "",
      email: profile.email ?? user?.email ?? "",
      phone: profile.phone ?? user?.phone ?? "",
      title: profile.title ?? user?.title ?? "",
      skills: profile.skills ?? user?.skills ?? "",
      summary: profile.summary ?? user?.summary ?? "",
      projects: profile.projects ?? user?.projects ?? "",
      gmailAddress: profile.gmailAddress ?? user?.gmailAddress ?? "",
      gmailAppPassword: profile.gmailAppPassword ?? user?.gmailAppPassword ?? "",
      resumeName: profile.resumeName ?? user?.resumeName,
      systemPrompt: profile.systemPrompt ?? user?.systemPrompt,
      groqApiKey: profile.groqApiKey ?? user?.groqApiKey,
      hfToken: profile.hfToken ?? user?.hfToken,
    };
    return user;
  },
  listApplications: () => applications,
  getApplication: (id: number) => applications.find((app) => app.id === id) ?? null,
  createApplication: (payload: Partial<JobApplication>) => {
    const created: JobApplication = {
      id: nextAppId++,
      company: payload.company ?? "Unknown Company",
      role: payload.role ?? "Unknown Role",
      source: payload.source ?? "text",
      contactEmail: payload.contactEmail ?? "hr@example.com",
      status: "drafted",
      createdAt: new Date().toISOString(),
    };
    applications.unshift(created);
    drafts.unshift(buildDraft(created.id, created.company, created.role));
    return created;
  },
  deleteApplication: (id: number) => {
    const index = applications.findIndex((app) => app.id === id);
    if (index < 0) return false;
    applications.splice(index, 1);
    for (let i = drafts.length - 1; i >= 0; i--) {
      if (drafts[i].applicationId === id) drafts.splice(i, 1);
    }
    return true;
  },
  getDraftByApplication: (applicationId: number) => drafts.find((draft) => draft.applicationId === applicationId) ?? null,
  listDrafts: () => drafts,
  getDraft: (id: number) => drafts.find((draft) => draft.id === id) ?? null,
  deleteDraft: (id: number) => {
    const index = drafts.findIndex((draft) => draft.id === id);
    if (!index && index < 0) return false; // wait, the original logic is index < 0
    if (index < 0) return false;
    drafts.splice(index, 1);
    return true;
  },
  updateDraft: (id: number, payload: { subject?: string; body?: string; cc?: string[] }) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return null;
    if (payload.subject !== undefined) draft.subject = payload.subject;
    if (payload.body !== undefined) draft.body = payload.body;
    if (payload.cc !== undefined) draft.cc = payload.cc;
    return draft;
  },
  regenerateDraft: (id: number, instruction?: string) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return null;
    draft.body = `${draft.body}\n\nRegenerated${instruction ? ` with instruction: ${instruction}` : ""}.`;
    return draft;
  },
  toggleStar: (applicationId: number) => {
    const draft = drafts.find((item) => item.applicationId === applicationId);
    if (!draft) return null;
    draft.starred = !draft.starred;
    return draft;
  },
  toggleFavorite: (applicationId: number) => {
    const draft = drafts.find((item) => item.applicationId === applicationId);
    if (!draft) return null;
    draft.favorite = !draft.favorite;
    return draft;
  },
  sendDraft: (id: number) => {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return null;
    draft.sent = true;
    const app = applications.find((item) => item.id === draft.applicationId);
    if (app) app.status = "sent";
    return draft;
  },
  listReplies: () => replies,
  addReply: (applicationId: number, message: string) => {
    const reply: Reply = {
      id: replies.length + 1,
      applicationId,
      message,
      classification: "Neutral",
    };
    replies.unshift(reply);
    const app = applications.find((item) => item.id === applicationId);
    if (app) app.status = "replied";
    return reply;
  },
  listCampaigns: () => campaigns,
  createCampaign: (name: string) => {
    const campaign: Campaign = {
      id: nextCampaignId++,
      name,
      status: "running",
      sent: 0,
      failed: 0,
      total: 0,
      items: [],
    };
    campaigns.unshift(campaign);
    return campaign;
  },
  getCampaign: (id: number) => campaigns.find((campaign) => campaign.id === id) ?? null,
  updateCampaignStatus: (id: number, status: Campaign["status"]) => {
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) return null;
    campaign.status = status;
    return campaign;
  },
  stats: () => ({
    totalApplications: applications.length,
    drafted: applications.filter((app) => app.status === "drafted").length,
    sent: applications.filter((app) => app.status === "sent").length,
    replies: applications.filter((app) => app.status === "replied").length,
  }),
};
