import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import TopicsClient from "../components/TopicsClient";

export const revalidate = 0;

export default async function TopicsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Baseline current date (June 28, 2026)
  const BASELINE_DATE = "2026-06-28";

  // Fetch topics
  const topics = await query("SELECT * FROM topics");

  // Fetch upcoming recording plans (so they can slot topics)
  const recordingPlans = await query(
    "SELECT * FROM recording_plans WHERE record_date >= ? ORDER BY record_date ASC",
    [BASELINE_DATE]
  );

  // Fetch formats
  const formatsList = await query("SELECT id, name FROM formats ORDER BY name ASC");

  return (
    <TopicsClient
      topics={topics}
      recordingPlans={recordingPlans}
      formatsList={formatsList}
    />
  );
}
