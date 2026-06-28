import { cookies } from "next/headers";
import crypto from "crypto";
import { query } from "./db";

const SALT = "equacast_salt_2026";
const SESSION_SECRET = "equacast_secret_session_key_2026";
const COOKIE_NAME = "equacast_session";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

export interface SessionUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
}

// Generate a signed session token: userId:username:role:timestamp:signature
export function createSessionToken(user: SessionUser): string {
  const timestamp = Date.now();
  const payload = `${user.id}:${user.username}:${user.role}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

// Verify and parse a session token
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 5) return null;
    
    const [idStr, username, role, timestampStr, signature] = parts;
    const payload = `${idStr}:${username}:${role}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");
      
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Check if token is older than 7 days
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return {
      id: parseInt(idStr, 10),
      username,
      display_name: "", // Will be populated from DB or empty
      role,
    };
  } catch (e) {
    return null;
  }
}

// Get the current logged in user (runs in Server Components / Actions)
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const user = verifySessionToken(token);
  if (!user) return null;
  
  // Fetch full user details from DB (including display name)
  const users = await query(
    "SELECT id, username, display_name, role FROM users WHERE id = ?",
    [user.id]
  );
  if (users.length === 0) return null;
  
  return users[0];
}

// Set session cookie (runs in API route or Server Action)
export async function setSession(user: SessionUser) {
  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Clear session cookie
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
