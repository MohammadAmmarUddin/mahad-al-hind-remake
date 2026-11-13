const { initializeApp, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { OAuth2Client } = require("google-auth-library");

// Firebase ID tokens (web + any Firebase-native client) are issued for the
// Firebase project id, not for an OAuth client id.
const FIREBASE_PROJECT_ID =
  process.env.GOOGLE_FIREBASE_PROJECT_ID || "context-auth-e9060";

// Google-native ID tokens (google_sign_in on Android) are issued for the
// OAuth client ids. Accept every configured client so Android and web can
// share one endpoint. Comma-separated; GOOGLE_CLIENT_ID kept for back-compat.
const GOOGLE_AUDIENCES = (
  process.env.GOOGLE_OAUTH_CLIENT_IDS ||
  process.env.GOOGLE_CLIENT_ID ||
  ""
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

let firebaseAuth = null;
let oauthClient = null;

// One long-lived client per process. Both libraries cache Google's signing
// certificates internally, so a login costs one verification and no extra
// network round trip in the common case.
function getFirebaseAuth() {
  if (!firebaseAuth) {
    const app = getApps().length
      ? getApps()[0]
      : initializeApp({ projectId: FIREBASE_PROJECT_ID });
    firebaseAuth = getAuth(app);
  }
  return firebaseAuth;
}

function getOAuthClient() {
  if (!oauthClient) oauthClient = new OAuth2Client();
  return oauthClient;
}

class GoogleAuthError extends Error {
  constructor(code) {
    super("Google sign-in could not be verified");
    this.name = "GoogleAuthError";
    this.code = code;
  }
}

async function verifyFirebaseToken(idToken) {
  try {
    const decoded = await getFirebaseAuth().verifyIdToken(idToken, false);
    return {
      provider: "firebase",
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
      name: decoded.name || "",
      picture: decoded.picture || "",
      subject: decoded.uid,
    };
  } catch (error) {
    // Never surface the library message: it can contain token fragments.
    console.warn(
      "[google-auth] firebase token rejected:",
      error.code || error.name || "unknown",
    );
    throw new GoogleAuthError("invalid_token");
  }
}

async function verifyGoogleToken(idToken) {
  if (GOOGLE_AUDIENCES.length === 0) {
    console.error(
      "[google-auth] GOOGLE_OAUTH_CLIENT_IDS / GOOGLE_CLIENT_ID is not configured",
    );
    throw new GoogleAuthError("not_configured");
  }

  try {
    const ticket = await getOAuthClient().verifyIdToken({
      idToken,
      audience: GOOGLE_AUDIENCES,
    });
    const payload = ticket.getPayload() || {};
    return {
      provider: "google",
      email: payload.email,
      emailVerified: payload.email_verified === true,
      name: payload.name || "",
      picture: payload.picture || "",
      subject: payload.sub,
    };
  } catch (error) {
    // Only the error class: library messages can echo token fragments.
    console.warn(
      "[google-auth] google token rejected:",
      error.code || error.name || "unknown",
    );
    throw new GoogleAuthError("invalid_token");
  }
}

/**
 * Verifies an ID token from either the browser (Firebase) or the Android app
 * (Google Sign-In) and returns the trusted profile fields.
 *
 * Signature, issuer, audience and expiry are all enforced by the libraries;
 * the caller still must reject an unverified email.
 */
async function verifyGoogleIdToken(idToken, provider = "google") {
  if (typeof idToken !== "string" || idToken.length === 0) {
    throw new GoogleAuthError("missing_token");
  }
  return provider === "firebase"
    ? verifyFirebaseToken(idToken)
    : verifyGoogleToken(idToken);
}

module.exports = {
  verifyGoogleIdToken,
  GoogleAuthError,
  FIREBASE_PROJECT_ID,
  GOOGLE_AUDIENCES,
};
