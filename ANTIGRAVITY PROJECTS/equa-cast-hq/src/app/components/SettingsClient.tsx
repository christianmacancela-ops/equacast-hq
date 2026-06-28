"use client";

import { useState } from "react";
import { updateChannelStatsAction, resetDatabaseAction } from "@/lib/actions";

interface SettingsClientProps {
  currentStats: any;
  activityLogs: any[];
  currentUser: {
    username: string;
    display_name: string;
    role: string;
  };
}

export default function SettingsClient({
  currentStats,
  activityLogs,
  currentUser
}: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Baseline input states
  const [tiktok, setTiktok] = useState(currentStats?.tiktok_followers || 11800);
  const [instagram, setInstagram] = useState(currentStats?.instagram_followers || 1635);
  const [youtubeSub, setYoutubeSub] = useState(currentStats?.youtube_subscribers || 1973);
  const [youtubeViews28d, setYoutubeViews28d] = useState(currentStats?.youtube_views_28d || 4387);
  const [youtubeMonthly, setYoutubeMonthly] = useState(currentStats?.youtube_monthly_audience || 2400);
  const [femaleShare, setFemaleShare] = useState(((currentStats?.youtube_female_share || 0.026) * 100).toFixed(1));
  const [newShare, setNewShare] = useState(((currentStats?.youtube_new_viewer_share || 0.987) * 100).toFixed(1));
  const [regularShare, setRegularShare] = useState(((currentStats?.youtube_regular_viewer_share || 0.001) * 100).toFixed(1));

  const handleUpdateStats = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fShare = parseFloat(femaleShare) / 100;
    const nShare = parseFloat(newShare) / 100;
    const rShare = parseFloat(regularShare) / 100;

    const result = await updateChannelStatsAction({
      tiktok_followers: parseInt(tiktok.toString()),
      instagram_followers: parseInt(instagram.toString()),
      youtube_subscribers: parseInt(youtubeSub.toString()),
      youtube_views_28d: parseInt(youtubeViews28d.toString()),
      youtube_monthly_audience: parseInt(youtubeMonthly.toString()),
      youtube_female_share: fShare,
      youtube_new_viewer_share: nShare,
      youtube_regular_viewer_share: rShare
    });

    setLoading(false);
    if (result.success) {
      setSuccessMsg("Channel statistics updated successfully!");
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  const handleResetDatabase = async () => {
    if (currentUser.role !== "admin") {
      alert("Only Chris (Admin) is permitted to reset the database.");
      return;
    }

    const conf = window.confirm(
      "WARNING: This will delete all custom topics, clip view modifications, checkmarks, and weekly Sunday reviews, resetting them to the Excel workbook's original data. Do you wish to continue?"
    );
    if (!conf) return;

    setLoading(true);
    const result: any = await resetDatabaseAction();
    setLoading(false);

    if (result.success) {
      alert("Database reset successfully completed. Page will reload.");
      window.location.href = "/";
    } else {
      alert(`Database reset failed: ${result.error}`);
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
        <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Settings</h1>
        <p style={{ color: "#A1A1AA" }}>Manage channel follower baselines, download CSV summaries, and audit user logs.</p>
      </div>

      <div className="grid-2" style={{ alignItems: "start", gap: "2.5rem" }}>
        {/* Left Side: Baselines & Database tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Baselines form */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>📈 Platform Follower Baselines</h3>
            <form onSubmit={handleUpdateStats}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">TikTok Followers</label>
                  <input className="form-input" type="number" value={tiktok} onChange={(e) => setTiktok(parseInt(e.target.value) || 0)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram Followers</label>
                  <input className="form-input" type="number" value={instagram} onChange={(e) => setInstagram(parseInt(e.target.value) || 0)} required />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">YouTube Subscribers</label>
                  <input className="form-input" type="number" value={youtubeSub} onChange={(e) => setYoutubeSub(parseInt(e.target.value) || 0)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">YT 28-day Views</label>
                  <input className="form-input" type="number" value={youtubeViews28d} onChange={(e) => setYoutubeViews28d(parseInt(e.target.value) || 0)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">YT Monthly Audience</label>
                  <input className="form-input" type="number" value={youtubeMonthly} onChange={(e) => setYoutubeMonthly(parseInt(e.target.value) || 0)} required />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">YT Female Share %</label>
                  <input className="form-input" type="number" step="0.1" value={femaleShare} onChange={(e) => setFemaleShare(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">YT New Viewer %</label>
                  <input className="form-input" type="number" step="0.1" value={newShare} onChange={(e) => setNewShare(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">YT Regular Viewer %</label>
                  <input className="form-input" type="number" step="0.1" value={regularShare} onChange={(e) => setRegularShare(e.target.value)} required />
                </div>
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
                {loading ? "Updating..." : "Update Baselines"}
              </button>
            </form>
          </div>

          {/* Export tools */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>📥 Export CSV Spreadsheets</h3>
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Download complete tables as CSV files to open directly in Excel or Google Sheets.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <a href="/api/export/topics" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>Export Topics</a>
              <a href="/api/export/clips" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>Export Clips</a>
              <a href="/api/export/recording_plans" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>Export Recording Plan</a>
              <a href="/api/export/weekly_reviews" className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>Export Sunday Reviews</a>
            </div>
          </div>

          {/* DB reset panel */}
          <div className="card" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.02)" }}>
            <h3 className="card-title" style={{ color: "#EF4444", marginBottom: "0.75rem" }}>⚠️ Dangerous Actions</h3>
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Admin operations to wipe database entries. This action cannot be undone.
            </p>
            <button 
              className="btn btn-danger" 
              style={{ width: "100%", fontWeight: 700 }}
              onClick={handleResetDatabase}
              disabled={loading}
            >
              Reset Database to Seed State
            </button>
          </div>
        </div>

        {/* Right Side: Activity Log / Audit Trail */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>📋 Activity Logs & Audit Trail</h3>
          {activityLogs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "550px", overflowY: "auto" }}>
              {activityLogs.map((log) => {
                const dateFormatted = new Date(log.timestamp).toLocaleString();
                return (
                  <div 
                    key={log.id} 
                    style={{ 
                      padding: "0.75rem", 
                      backgroundColor: "rgba(0,0,0,0.15)", 
                      borderRadius: "6px", 
                      border: "1px solid #26262B",
                      fontSize: "0.8rem" 
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#FF5A1F", fontWeight: 600, marginBottom: "0.25rem" }}>
                      <span>{log.user} ({log.action})</span>
                      <span style={{ color: "#52525B" }}>{dateFormatted}</span>
                    </div>
                    <p style={{ color: "#FFF" }}>{log.details}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem", textAlign: "center", padding: "3rem" }}>
              No activities logged yet. Perform database writes to log.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
