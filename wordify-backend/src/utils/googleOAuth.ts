import axios from "axios";
import jwt from "jsonwebtoken";
import querystring from "node:querystring";
import config from "../config/index";

const { googleClientId, googleClientSecret, googleRedirectUri } = config;

type GoogleTokensResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export type GoogleIdTokenPayload = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function getGoogleAuthUrl(state: string) {
  const params = querystring.stringify({
    client_id: googleClientId!,
    redirect_uri: googleRedirectUri!,
    response_type: "code",
    scope: ["openid", "email", "profile"].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params}`;
}

export async function getGoogleTokens(code: string): Promise<GoogleTokensResponse> {
  const url = "https://oauth2.googleapis.com/token";

  const body = new URLSearchParams({
    code,
    client_id: googleClientId!,
    client_secret: googleClientSecret!,
    redirect_uri: googleRedirectUri!,
    grant_type: "authorization_code",
  });

  const { data } = await axios.post<GoogleTokensResponse>(url, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return data;
}

function getHighResGooglePicture(url?: string, size = 400): string | undefined {
  if (!url) return undefined;
  return url.replace(/=s\d+-c/, `=s${size}-c`);
}

export async function decodeGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
  const decoded = jwt.decode(idToken) as GoogleIdTokenPayload | null;
  if (!decoded || !decoded.email) {
    throw new Error("Invalid Google ID token");
  }
  decoded.picture = getHighResGooglePicture(decoded.picture);

  if (decoded.picture) {
    await axios.get(decoded.picture, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      responseType: "arraybuffer",
    });
  }

  return decoded;
}
