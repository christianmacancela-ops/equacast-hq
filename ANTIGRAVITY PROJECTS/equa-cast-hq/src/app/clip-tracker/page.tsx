import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";
import ClipTrackerClient from "../components/ClipTrackerClient";

export const revalidate = 0;

export default async function ClipTrackerPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch all clips
  const clips = await query("SELECT * FROM clips ORDER BY publish_date DESC, clip_id_code DESC");

  // Fetch formats for the creation drop-down
  const formats = await query("SELECT id, name FROM formats ORDER BY name ASC");

  return (
    <ClipTrackerClient
      clips={clips}
      formats={formats}
    />
  );
}
