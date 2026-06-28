"use client";

import { useState, useEffect } from "react";
import { addWeeklyReviewAction } from "@/lib/actions";

interface WeeklyReviewClientProps {
  initialReviews: any[];
  allClips: any[];
}

export default function WeeklyReviewClient({ initialReviews, allClips }: WeeklyReviewClientProps) {
  // Generate a list of available weeks (e.g. biweekly cycle alignment starting Mondays)
  // We can offer a set of pre-calculated week starts
  const availableWeeks = [
    { start: "2026-06-22", end: "2026-06-28" },
    { start: "2026-06-15", end: "2026-06-21" },
    { start: "2026-06-08", end: "2026-06-14" },
    { start: "2026-06-01", end: "2026-06-07" },
  ];

  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeWeek = availableWeeks[selectedWeekIdx];

  // Form states
  const [femaleShare, setFemaleShare] = useState("0.0");
  const [regularViewerShare, setRegularViewerShare] = useState("0.0");
  const [bestClip, setBestClip] = useState("");
  const [repeatNotes, setRepeatNotes] = useState("");
  const [stopNotes, setStopNotes] = useState("");
  const [testNextNotes, setTestNextNotes] = useState("");

  // Calculate dynamic stats for selected week from clips database
  const getWeekClips = () => {
    const start = new Date(activeWeek.start);
    const end = new Date(activeWeek.end);
    
    return allClips.filter((c) => {
      if (!c.publish_date || c.edit_status !== "Published") return false;
      const pubDate = new Date(c.publish_date);
      return pubDate >= start && pubDate <= end;
    });
  };

  const weekClips = getWeekClips();
  const publishedCount = weekClips.length;
  const totalViews = weekClips.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalEngagements = weekClips.reduce((acc, c) => acc + (c.engagements || 0), 0);
  const avgViewsPerClip = publishedCount > 0 ? totalViews / publishedCount : 0;

  // Find best performing clip by views in this week
  const calculatedBestClip = [...weekClips].sort((a, b) => b.views - a.views)[0]?.clip_id_code || "";

  // Load existing review if saved in database
  useEffect(() => {
    const existing = initialReviews.find((r) => r.week_start.startsWith(activeWeek.start));
    if (existing) {
      setFemaleShare((existing.female_share * 100).toFixed(1));
      setRegularViewerShare((existing.regular_viewer_share * 100).toFixed(1));
      setBestClip(existing.best_clip || calculatedBestClip);
      setRepeatNotes(existing.repeat_notes || "");
      setStopNotes(existing.stop_notes || "");
      setTestNextNotes(existing.test_next_notes || "");
    } else {
      setFemaleShare("2.6"); // Fallback baseline female share
      setRegularViewerShare("0.1"); // Fallback regular viewer share
      setBestClip(calculatedBestClip);
      setRepeatNotes("");
      setStopNotes("");
      setTestNextNotes("");
    }
  }, [selectedWeekIdx, initialReviews]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fShare = parseFloat(femaleShare) / 100;
    const rShare = parseFloat(regularViewerShare) / 100;

    const result = await addWeeklyReviewAction({
      week_start: activeWeek.start,
      week_end: activeWeek.end,
      published_clips: publishedCount,
      total_views: totalViews,
      engagements: totalEngagements,
      female_share: fShare,
      regular_viewer_share: rShare,
      best_clip: bestClip || calculatedBestClip,
      repeat_notes: repeatNotes,
      stop_notes: stopNotes,
      test_next_notes: testNextNotes
    });

    setLoading(false);
    if (result.success) {
      setSuccessMsg("Weekly Review saved successfully!");
      setTimeout(() => {
        setSuccessMsg(null);
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div>
      {successMsg && (
        <div className="alert-banner alert-success" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Weekly Review</h1>
        <p style={{ color: "#A1A1AA" }}>Guided 10-minute Sunday review to adjust topics and publishing habits.</p>
      </div>

      {/* Grid splits: Left guided entry form, Right Review Logs */}
      <div className="grid-2" style={{ alignItems: "start", gap: "2rem" }}>
        {/* Guided Form Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Sunday Performance Review</h3>
            <select 
              className="form-select" 
              style={{ width: "auto", padding: "0.35rem 1.5rem", fontSize: "0.85rem" }}
              value={selectedWeekIdx}
              onChange={(e) => setSelectedWeekIdx(parseInt(e.target.value))}
            >
              {availableWeeks.map((w, idx) => (
                <option key={idx} value={idx}>
                  Week: {w.start} to {w.end}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Computed performance read-out */}
            <div 
              style={{ 
                padding: "1rem", 
                backgroundColor: "rgba(0,0,0,0.15)", 
                borderRadius: "8px", 
                marginBottom: "1.5rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem" 
              }}
            >
              <div>
                <span className="countdown-label">Published Clips</span>
                <div style={{ fontSize: "1.25rem", color: "#FFF", fontWeight: 700 }}>{publishedCount} posts</div>
              </div>
              <div>
                <span className="countdown-label">Total Views Tracked</span>
                <div style={{ fontSize: "1.25rem", color: "#FFF", fontWeight: 700 }}>{totalViews.toLocaleString()}</div>
              </div>
              <div>
                <span className="countdown-label">Aggregated Engagements</span>
                <div style={{ fontSize: "1.25rem", color: "#FFF", fontWeight: 700 }}>{totalEngagements.toLocaleString()}</div>
              </div>
              <div>
                <span className="countdown-label">Average Views / Clip</span>
                <div style={{ fontSize: "1.25rem", color: "#FFF", fontWeight: 700 }}>{Math.round(avgViewsPerClip).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Female Audience Share %</label>
                <input 
                  className="form-input" 
                  type="number" 
                  step="0.1" 
                  value={femaleShare}
                  onChange={(e) => setFemaleShare(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Returning Viewer Share %</label>
                <input 
                  className="form-input" 
                  type="number" 
                  step="0.1" 
                  value={regularViewerShare}
                  onChange={(e) => setRegularViewerShare(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Best-Performing Clip ID</label>
              <input 
                className="form-input" 
                value={bestClip}
                onChange={(e) => setBestClip(e.target.value)}
                placeholder="e.g. DRMJ-TT" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">🔁 What to Repeat (What worked?)</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                value={repeatNotes}
                onChange={(e) => setRepeatNotes(e.target.value)}
                placeholder="e.g. Visual questions onscreen before hosts speak." 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">🛑 What to Stop (What didn't work?)</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                value={stopNotes}
                onChange={(e) => setStopNotes(e.target.value)}
                placeholder="e.g. 1:40 min clips that lose viewers in the first 5 seconds." 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label">🧪 What to Test Next (Hypothesis)</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                value={testNextNotes}
                onChange={(e) => setTestNextNotes(e.target.value)}
                placeholder="e.g. Test 'Upgrade or Downgrade' format on NY Sports topics." 
                required 
              />
            </div>

            <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Saving Review..." : "Lock Sunday Review"}
            </button>
          </form>
        </div>

        {/* History Log Card */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>📅 Saved Review History</h3>
          {initialReviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {initialReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  style={{ 
                    padding: "1rem", 
                    backgroundColor: "rgba(0,0,0,0.15)", 
                    borderRadius: "8px", 
                    border: "1px solid #26262B" 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong style={{ color: "#FFF", fontSize: "0.95rem" }}>{rev.week_start} to {rev.week_end}</strong>
                    <span className="badge badge-orange">{rev.published_clips} clips</span>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
                    <span>Views: <strong>{rev.total_views.toLocaleString()}</strong></span>
                    <span>Avg/Clip: <strong>{Math.round(rev.total_views / (rev.published_clips || 1)).toLocaleString()}</strong></span>
                    <span>Female: <strong>{(rev.female_share * 100).toFixed(1)}%</strong></span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#FFF" }}>
                    <p style={{ marginTop: "0.25rem" }}>🔄 <strong>Repeat:</strong> {rev.repeat_notes}</p>
                    <p style={{ marginTop: "0.25rem" }}>🛑 <strong>Stop:</strong> {rev.stop_notes}</p>
                    <p style={{ marginTop: "0.25rem" }}>🧪 <strong>Test:</strong> {rev.test_next_notes}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>
              No weekly reviews logged yet. Submit the form on the left to save.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
