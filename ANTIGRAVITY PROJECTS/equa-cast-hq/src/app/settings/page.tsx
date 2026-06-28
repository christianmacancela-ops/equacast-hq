import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import SettingsClient from "../components/SettingsClient";

export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch current stats baseline (row 1)
  const statsRows = await query("SELECT * FROM channel_stats WHERE id = 1");
  const currentStats = statsRows[0] || null;

  // Fetch activity log sorted by timestamp desc
  const activityLogs = await query("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 50");

  return (
    <SettingsClient
      currentStats={currentStats}
      activityLogs={activityLogs}
      currentUser={user}
    />
  );
}
