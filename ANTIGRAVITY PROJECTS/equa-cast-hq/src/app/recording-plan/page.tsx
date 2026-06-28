import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import RecordingPlanClient from "../components/RecordingPlanClient";

export const revalidate = 0;

export default async function RecordingPlanPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch recording plans sorted by date
  const recordingPlans = await query("SELECT * FROM recording_plans ORDER BY record_date ASC");

  // 2. Fetch all topics
  const topics = await query("SELECT * FROM topics");

  // 3. Build map of topics
  const topicsMap: Record<number, any> = {};
  topics.forEach((t) => {
    topicsMap[t.id] = t;
  });

  // 4. Calculate which topics are already slotted in any recording plan
  const slottedTopicIds = new Set<string>();
  recordingPlans.forEach((plan) => {
    try {
      const segs = JSON.parse(plan.segments || "[]");
      segs.forEach((sid: string) => {
        if (sid) slottedTopicIds.add(sid.toString());
      });
    } catch (e) {}
  });

  // 5. Filter unslotted topics that can be selected in dropdowns (excluding 'Recorded' or already slotted ones)
  const unslottedTopics = topics.filter(
    (t) => !slottedTopicIds.has(t.id.toString()) && t.status !== "Recorded"
  );

  return (
    <RecordingPlanClient
      recordingPlans={recordingPlans}
      topicsMap={topicsMap}
      unslottedTopics={unslottedTopics}
    />
  );
}
