import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { store } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/setup?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/setup?error=missing_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/auth/callback/google";

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Google OAuth credentials not configured." }, { status: 500 });
  }

  try {
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      // Save refresh token to store
      store.setUser({
        gmailRefreshToken: tokens.refresh_token,
      });
      
      // If we want to get the user's email address using the access token:
      try {
        oauth2Client.setCredentials(tokens);
        const userInfoRes = await oauth2Client.request({ url: "https://www.googleapis.com/oauth2/v2/userinfo" });
        const userInfo = userInfoRes.data as any;
        const userEmail = userInfo.email;
        const userName = userInfo.name;
        
        const updates: any = {};
        if (userEmail) {
           updates.gmailAddress = userEmail;
           
           // If the primary profile email isn't set (e.g. logging in via Google directly), set it
           const currentUser = store.getUser();
           if (!currentUser || !currentUser.email) {
             updates.email = userEmail;
             updates.fullName = userName || "User";
           }
        }
        
        if (Object.keys(updates).length > 0) {
           store.setUser(updates);
        }
      } catch (e) {
        console.error("Failed to fetch user email:", e);
      }
      
      return NextResponse.redirect(new URL("/setup?success=gmail_connected", request.url));
    } else {
      // If we didn't get a refresh token, it means the user has authorized us before,
      // and we need to force them to re-consent to get a new one, or the flow is broken.
      // We set prompt="consent" in the login route, so this shouldn't happen, but just in case.
      return NextResponse.redirect(new URL("/setup?error=no_refresh_token", request.url));
    }
  } catch (err: any) {
    console.error("OAuth token exchange error:", err);
    return NextResponse.redirect(new URL("/setup?error=exchange_failed", request.url));
  }
}
