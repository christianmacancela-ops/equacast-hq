"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { query, execute } from "./db";
import { getSessionUser, setSession, clearSession, hashPassword, SessionUser } from "./auth";

// Helper to log user activities
async function logActivity(user: string, action: string, details: string) {
  const timestamp = new Date().toISOString();
  await execute(
    "INSERT INTO activity_log (timestamp, user, action, details) VALUES (?, ?, ?, ?)",
    [timestamp, user, action, details]
  );
}

// 1. Authentication actions
export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  try {
    const users = await query("SELECT id, username, password_hash, display_name, role FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
      return { error: "Invalid username or password." };
    }

    const user = users[0];
    const hashed = hashPassword(password);
    if (user.password_hash !== hashed) {
      return { error: "Invalid username or password." };
    }

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
    };

    await setSession(sessionUser);
    await logActivity(user.display_name, "Login", "User logged in successfully");

    return { success: true };
  } catch (e) {
    console.error("Login action error:", e);
    return { error: "An unexpected database error occurred." };
  }
}

export async function logoutAction() {
  const user = await getSessionUser();
  if (user) {
    await logActivity(user.display_name, "Logout", "User logged out");
  }
  await clearSession();
  return { success: true };
}

// 2. Topic actions
export async function addTopicAction(data: {
  pillar: string;
  topic: string;
  why_now: string;
  hook_draft: string;
  format: string;
  source_url?: string;
  notes?: string;
  freshness: number;
  opinion_tension: number;
  recognition: number;
  participation: number;
  status?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const total_score = data.freshness + data.opinion_tension + data.recognition + data.participation;
  const recommendation = total_score >= 16 ? "RECORD" : (total_score >= 12 ? "CONSIDER" : "PARK");
  const status = data.status || "Inbox";
  const date_added = new Date().toISOString().split("T")[0];

  await execute(
    `INSERT INTO topics (
      date_added, owner, pillar, topic, why_now, hook_draft, format, 
      freshness, opinion_tension, recognition, participation, 
      total_score, recommendation, status, source_url, notes, 
      last_edited_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      date_added,
      user.display_name,
      data.pillar,
      data.topic,
      data.why_now,
      data.hook_draft,
      data.format,
      data.freshness,
      data.opinion_tension,
      data.recognition,
      data.participation,
      total_score,
      recommendation,
      status,
      data.source_url || "",
      data.notes || "",
      user.display_name,
      date_added
    ]
  );

  await logActivity(user.display_name, "Add Topic", `Added topic: "${data.topic}" (Score: ${total_score})`);
  revalidatePath("/topics");
  revalidatePath("/");
  return { success: true };
}

export async function updateTopicAction(id: number, data: {
  owner: string;
  pillar: string;
  topic: string;
  why_now: string;
  hook_draft: string;
  format: string;
  freshness: number;
  opinion_tension: number;
  recognition: number;
  participation: number;
  status: string;
  source_url?: string;
  notes?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const total_score = data.freshness + data.opinion_tension + data.recognition + data.participation;
  const recommendation = total_score >= 16 ? "RECORD" : (total_score >= 12 ? "CONSIDER" : "PARK");
  const date_str = new Date().toISOString().split("T")[0];

  await execute(
    `UPDATE topics SET 
      owner = ?, pillar = ?, topic = ?, why_now = ?, hook_draft = ?, format = ?, 
      freshness = ?, opinion_tension = ?, recognition = ?, participation = ?, 
      total_score = ?, recommendation = ?, status = ?, source_url = ?, notes = ?, 
      last_edited_by = ?, updated_at = ?
     WHERE id = ?`,
    [
      data.owner,
      data.pillar,
      data.topic,
      data.why_now,
      data.hook_draft,
      data.format,
      data.freshness,
      data.opinion_tension,
      data.recognition,
      data.participation,
      total_score,
      recommendation,
      data.status,
      data.source_url || "",
      data.notes || "",
      user.display_name,
      date_str,
      id
    ]
  );

  await logActivity(user.display_name, "Update Topic", `Updated topic #${id}: "${data.topic}"`);
  revalidatePath("/topics");
  revalidatePath("/");
  return { success: true };
}

// 3. Recording Plan Actions
export async function updateRecordingPlanAction(id: number, data: {
  record_date: string;
  episode_theme: string;
  guest_third_mic: string;
  owner: string;
  record_status: string;
  long_form_target: string;
  notes: string;
  checklist: any;
  segments: string[];
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const date_str = new Date().toISOString().split("T")[0];

  await execute(
    `UPDATE recording_plans SET 
      record_date = ?, episode_theme = ?, guest_third_mic = ?, owner = ?, 
      record_status = ?, long_form_target = ?, notes = ?, checklist = ?, 
      segments = ?, last_edited_by = ?, updated_at = ?
     WHERE id = ?`,
    [
      data.record_date,
      data.episode_theme,
      data.guest_third_mic,
      data.owner,
      data.record_status,
      data.long_form_target,
      data.notes,
      JSON.stringify(data.checklist),
      JSON.stringify(data.segments),
      user.display_name,
      date_str,
      id
    ]
  );

  await logActivity(user.display_name, "Update Recording", `Updated Recording Plan for ${data.record_date}`);
  
  // Auto update status of topics linked in this plan
  for (const seg of data.segments) {
    if (seg && !isNaN(Number(seg))) {
      await execute("UPDATE topics SET status = 'Recorded' WHERE id = ? AND status != 'Recorded'", [Number(seg)]);
    }
  }

  revalidatePath("/recording-plan");
  revalidatePath("/");
  return { success: true };
}

export async function addRecordingPlanAction(data: {
  record_date: string;
  episode_theme: string;
  guest_third_mic: string;
  owner: string;
  record_status: string;
  long_form_target: string;
  notes: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const date_str = new Date().toISOString().split("T")[0];
  const checklist_init = {
    topics_locked: false,
    hooks_written: false,
    research_complete: false,
    equipment_ready: false,
    guest_confirmed: false,
    episode_recorded: false,
    clip_moments_marked: false,
    long_form_edit_complete: false,
    shorts_prepared: false,
    content_published: false
  };

  const segments = ["", "", "", "", ""];

  await execute(
    `INSERT INTO recording_plans (
      record_date, cycle, episode_theme, guest_third_mic, owner, record_status, 
      long_form_target, notes, checklist, segments, last_edited_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.record_date,
      `Cycle New`,
      data.episode_theme,
      data.guest_third_mic,
      data.owner || "Both",
      data.record_status || "Not Started",
      data.long_form_target,
      data.notes || "",
      JSON.stringify(checklist_init),
      JSON.stringify(segments),
      user.display_name,
      date_str
    ]
  );

  await logActivity(user.display_name, "Add Recording Plan", `Added recording schedule for ${data.record_date}`);
  revalidatePath("/recording-plan");
  revalidatePath("/");
  return { success: true };
}

// 4. Clip Tracker Actions
export async function addClipAction(data: {
  clip_id_code: string;
  recording: string;
  pillar: string;
  topic: string;
  hook: string;
  format: string;
  owner: string;
  edit_status: string;
  platform: string;
  publish_status: string;
  publish_date?: string;
  url?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  avg_viewed_pct?: number;
  views_24h?: number;
  views_7d?: number;
  lesson_learned?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const parent_code = data.clip_id_code.split("-")[0];
  const views = data.views || 0;
  const likes = data.likes || 0;
  const comments = data.comments || 0;
  const shares = data.shares || 0;
  const saves = data.saves || 0;
  
  const engagements = likes + comments + shares + saves;
  const engagement_rate = views > 0 ? engagements / views : 0;

  await execute(
    `INSERT INTO clips (
      clip_id_code, recording, pillar, topic, hook, format, owner, edit_status, 
      platform, publish_status, publish_date, url, views, likes, comments, 
      shares, saves, engagements, engagement_rate, avg_viewed_pct, views_24h, 
      views_7d, lesson_learned, parent_clip_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.clip_id_code,
      data.recording,
      data.pillar,
      data.topic,
      data.hook,
      data.format,
      data.owner,
      data.edit_status,
      data.platform,
      data.publish_status,
      data.publish_date || "",
      data.url || "",
      views,
      likes,
      comments,
      shares,
      saves,
      engagements,
      engagement_rate,
      data.avg_viewed_pct || 0,
      data.views_24h || 0,
      data.views_7d || 0,
      data.lesson_learned || "",
      parent_code
    ]
  );

  await logActivity(user.display_name, "Add Clip", `Added clip record: ${data.clip_id_code} (${data.platform})`);
  revalidatePath("/clip-tracker");
  revalidatePath("/");
  return { success: true };
}

export async function updateClipAction(id: number, data: {
  clip_id_code: string;
  recording: string;
  pillar: string;
  topic: string;
  hook: string;
  format: string;
  owner: string;
  edit_status: string;
  platform: string;
  publish_status: string;
  publish_date?: string;
  url?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  avg_viewed_pct: number;
  views_24h: number;
  views_7d: number;
  lesson_learned: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const parent_code = data.clip_id_code.split("-")[0];
  const engagements = data.likes + data.comments + data.shares + data.saves;
  const engagement_rate = data.views > 0 ? engagements / data.views : 0;

  await execute(
    `UPDATE clips SET 
      clip_id_code = ?, recording = ?, pillar = ?, topic = ?, hook = ?, format = ?, 
      owner = ?, edit_status = ?, platform = ?, publish_status = ?, publish_date = ?, 
      url = ?, views = ?, likes = ?, comments = ?, shares = ?, saves = ?, 
      engagements = ?, engagement_rate = ?, avg_viewed_pct = ?, views_24h = ?, 
      views_7d = ?, lesson_learned = ?, parent_clip_code = ?
     WHERE id = ?`,
    [
      data.clip_id_code,
      data.recording,
      data.pillar,
      data.topic,
      data.hook,
      data.format,
      data.owner,
      data.edit_status,
      data.platform,
      data.publish_status,
      data.publish_date || "",
      data.url || "",
      data.views,
      data.likes,
      data.comments,
      data.shares,
      data.saves,
      engagements,
      engagement_rate,
      data.avg_viewed_pct,
      data.views_24h,
      data.views_7d,
      data.lesson_learned,
      parent_code,
      id
    ]
  );

  await logActivity(user.display_name, "Update Clip", `Updated clip #${id}: ${data.clip_id_code} (${data.platform})`);
  revalidatePath("/clip-tracker");
  revalidatePath("/weekly-review");
  revalidatePath("/analytics");
  revalidatePath("/");
  return { success: true };
}

// 5. Weekly Review Actions
export async function addWeeklyReviewAction(data: {
  week_start: string;
  week_end: string;
  published_clips: number;
  total_views: number;
  engagements: number;
  female_share: number;
  regular_viewer_share: number;
  best_clip: string;
  repeat_notes: string;
  stop_notes: string;
  test_next_notes: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  // Check if review already exists for this week
  const existing = await query("SELECT id FROM weekly_reviews WHERE week_start = ?", [data.week_start]);
  
  if (existing.length > 0) {
    // Update
    await execute(
      `UPDATE weekly_reviews SET 
        week_end = ?, published_clips = ?, total_views = ?, engagements = ?, 
        female_share = ?, regular_viewer_share = ?, best_clip = ?, 
        repeat_notes = ?, stop_notes = ?, test_next_notes = ?
       WHERE id = ?`,
      [
        data.week_end,
        data.published_clips,
        data.total_views,
        data.engagements,
        data.female_share,
        data.regular_viewer_share,
        data.best_clip,
        data.repeat_notes,
        data.stop_notes,
        data.test_next_notes,
        existing[0].id
      ]
    );
    await logActivity(user.display_name, "Update Weekly Review", `Updated Weekly Review for week starting ${data.week_start}`);
  } else {
    // Insert
    await execute(
      `INSERT INTO weekly_reviews (
        week_start, week_end, published_clips, total_views, engagements, 
        female_share, regular_viewer_share, best_clip, repeat_notes, stop_notes, test_next_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.week_start,
        data.week_end,
        data.published_clips,
        data.total_views,
        data.engagements,
        data.female_share,
        data.regular_viewer_share,
        data.best_clip,
        data.repeat_notes,
        data.stop_notes,
        data.test_next_notes
      ]
    );
    await logActivity(user.display_name, "Add Weekly Review", `Saved new Weekly Review for week starting ${data.week_start}`);
  }

  revalidatePath("/weekly-review");
  revalidatePath("/");
  return { success: true };
}

// 6. Settings and baselines actions
export async function updateChannelStatsAction(data: {
  tiktok_followers: number;
  instagram_followers: number;
  youtube_subscribers: number;
  youtube_views_28d: number;
  youtube_monthly_audience: number;
  youtube_female_share: number;
  youtube_new_viewer_share: number;
  youtube_regular_viewer_share: number;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  const date_str = new Date().toISOString().split("T")[0];

  await execute(
    `UPDATE channel_stats SET 
      tiktok_followers = ?, instagram_followers = ?, youtube_subscribers = ?, 
      youtube_views_28d = ?, youtube_monthly_audience = ?, youtube_female_share = ?, 
      youtube_new_viewer_share = ?, youtube_regular_viewer_share = ?, updated_at = ?
     WHERE id = 1`,
    [
      data.tiktok_followers,
      data.instagram_followers,
      data.youtube_subscribers,
      data.youtube_views_28d,
      data.youtube_monthly_audience,
      data.youtube_female_share,
      data.youtube_new_viewer_share,
      data.youtube_regular_viewer_share,
      date_str
    ]
  );

  await logActivity(user.display_name, "Update Settings", "Updated channel stats and platform baselines");
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

// 7. Reset database from seed
export async function resetDatabaseAction() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") throw new Error("Unauthorized");

  const { exec } = require("child_process");
  const path = require("path");
  const scriptPath = path.join(process.cwd(), "seed_db.py");
  const pythonPath = "C:\\Users\\chris\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";

  return new Promise((resolve) => {
    exec(`"${pythonPath}" "${scriptPath}"`, async (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.error("Reset database error:", error, stderr);
        resolve({ error: "Failed to reset database from script." });
      } else {
        await logActivity(user.display_name, "Reset Database", "Restored database to original seed state");
        revalidatePath("/");
        resolve({ success: true });
      }
    });
  });
}
