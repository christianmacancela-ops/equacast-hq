import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import DashboardClient from "./components/DashboardClient";

export const revalidate = 0; // Disable server component caching to ensure live updates

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Baseline current date (June 28, 2026, as per Excel workbook context)
  const BASELINE_DATE = "2026-06-28";

  // 1. Fetch channel stats baseline
  const statsRows = await query("SELECT * FROM channel_stats WHERE id = 1");
  const channelStats = statsRows[0] || null;

  // 2. Fetch the next recording plan session
  const recRows = await query(
    "SELECT * FROM recording_plans WHERE record_date >= ? ORDER BY record_date ASC LIMIT 1",
    [BASELINE_DATE]
  );
  const nextRecording = recRows[0] || null;

  // 3. Count inbox unscored topics
  const unscoredRows = await query("SELECT COUNT(*) as count FROM topics WHERE status = 'Inbox'");
  const inboxCount = unscoredRows[0]?.count || 0;

  // 4. Fetch editing/review clips
  const editingClips = await query(
    "SELECT * FROM clips WHERE edit_status IN ('Editing', 'Review')"
  );

  // 5. Fetch ready/scheduled clips
  const readyClips = await query(
    "SELECT * FROM clips WHERE edit_status IN ('Ready', 'Scheduled')"
  );

  // 6. Fetch 5 recently published clips
  const recentClips = await query(
    "SELECT * FROM clips WHERE edit_status = 'Published' ORDER BY publish_date DESC LIMIT 5"
  );

  // 7. Fetch best performing clip
  const bestClipRows = await query(
    "SELECT * FROM clips WHERE edit_status = 'Published' ORDER BY views DESC LIMIT 1"
  );
  const bestClip = bestClipRows[0] || null;

  // 8. Fetch topics awaiting scoring (limit 3 for dashboard list)
  const topicsWaiting = await query(
    "SELECT id, topic FROM topics WHERE status = 'Inbox' LIMIT 3"
  );

  // 9. Check for overdue tasks
  // Overdue if: recording long-form release target is in the past, but record_status is not completed
  const overdueRecs = await query(
    "SELECT record_date, episode_theme FROM recording_plans WHERE long_form_target < ? AND record_status != 'Recorded'",
    [BASELINE_DATE]
  );
  const overdueTasks: string[] = [];
  overdueRecs.forEach((r) => {
    overdueTasks.push(`Recording cycle "${r.episode_theme}" (${r.record_date}) has not been marked as 'Recorded' and is past its long-form edit target date.`);
  });

  return (
    <DashboardClient
      channelStats={channelStats}
      nextRecording={nextRecording}
      inboxCount={inboxCount}
      editingClips={editingClips}
      readyClips={readyClips}
      recentClips={recentClips}
      bestClip={bestClip}
      topicsWaiting={topicsWaiting}
      overdueTasks={overdueTasks}
    />
  );
}
