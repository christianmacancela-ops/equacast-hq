import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import WeeklyReviewClient from "../components/WeeklyReviewClient";

export const revalidate = 0;

export default async function WeeklyReviewPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch saved reviews history
  const initialReviews = await query("SELECT * FROM weekly_reviews ORDER BY week_start DESC");

  // 2. Fetch all clips for dynamic calculations
  const allClips = await query("SELECT * FROM clips");

  return (
    <WeeklyReviewClient
      initialReviews={initialReviews}
      allClips={allClips}
    />
  );
}
