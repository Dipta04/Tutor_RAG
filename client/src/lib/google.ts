import "server-only";

export const OAUTH_STATE_COOKIE = "tutorrag_oauth_state";

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleProfile {
  email: string;
  name: string;
  sub: string;
}

/** Returns the OAuth settings only when all three are present. */
export function readGoogleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isGoogleEnabled(): boolean {
  return readGoogleConfig() !== null && Boolean(process.env.INTERNAL_API_KEY);
}

export function buildAuthorizeUrl(config: GoogleConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForIdToken(
  config: GoogleConfig,
  code: string,
): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Google rejected the sign-in code.");
  }

  const payload = (await response.json()) as { id_token?: string };
  if (!payload.id_token) {
    throw new Error("Google did not return an identity token.");
  }

  return payload.id_token;
}

/**
 * Reads the claims out of an ID token.
 *
 * The signature is not re-checked: this token came straight from Google's
 * token endpoint over TLS in a server-to-server call, which Google documents
 * as a trusted channel. A token received any other way must be verified
 * against Google's JWKS before it is trusted.
 */
export function readIdTokenClaims(idToken: string): GoogleProfile {
  const [, payload] = idToken.split(".");
  if (!payload) throw new Error("The identity token was malformed.");

  const normalised = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=");
  const claims = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    sub?: string;
  };

  const verified = claims.email_verified === true || claims.email_verified === "true";

  if (!claims.email || !claims.sub || !verified) {
    throw new Error("Google did not return a verified email address.");
  }

  return { email: claims.email, name: claims.name ?? "", sub: claims.sub };
}
