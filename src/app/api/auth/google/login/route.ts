import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Dynamically determine the redirect URI based on where the app is hosted
  const redirectUri = `${request.nextUrl.origin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth credentials not configured in environment." }, { status: 500 });
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  // Generate a url that asks permissions for Gmail full scope (required for SMTP)
  const scopes = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    // Force prompt to ensure a refresh token is provided every time during setup
    prompt: "consent",
    scope: scopes,
  });

  return NextResponse.redirect(authorizationUrl);
}
