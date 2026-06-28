"use client";

import { useState, useEffect } from "react";
import { addTopicAction, addClipAction, addRecordingPlanAction } from "@/lib/actions";

interface DashboardClientProps {
  channelStats: any;
  nextRecording: any;
  inboxCount: number;
  editingClips: any[];
  readyClips: any[];
  recentClips: any[];
  bestClip: any;
  topicsWaiting: any[];
  overdueTasks: string[];
}

export default function DashboardClient({
  channelStats,
  nextRecording,
  inboxCount,
  editingClips,
  readyClips,
  recentClips,
  bestClip,
  topicsWaiting,
  overdueTasks
}: DashboardClientProps) {
  // Modal states
  const [topicModal, setTopicModal] = useState(false);
  const [clipModal, setClipModal] = useState(false);
  const [recModal, setRecModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!nextRecording) return;
    
    // Set countdown target to the record date at 19:00 (7 PM)
    const targetDate = new Date(`${nextRecording.record_date}T19:00:00`);
    
    const updateCountdown = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextRecording]);

  // Generate today's recommendations
  const getRecommendations = () => {
    const recs = [];
    
    // 1. Topic scoring recommendation
    if (inboxCount > 0) {
      recs.push({
        action: "Score Topics",
        detail: `You have ${inboxCount} new topic(s) in the Topic Inbox waiting for scoring.`,
        link: "/topics"
      });
    }

    // 2. Prep next recording
    if (nextRecording) {
      const checklist = JSON.parse(nextRecording.checklist || "{}");
      if (!checklist.topics_locked || !checklist.hooks_written) {
        recs.push({
          action: "Lock rundown & hooks",
          detail: `Complete the prep checklists for the recording cycle on ${nextRecording.record_date}.`,
          link: "/recording-plan"
        });
      }
    }

    // 3. Clip editing / review
    if (editingClips.length > 0) {
      recs.push({
        action: "Edit clips",
        detail: `There are ${editingClips.length} clips currently in editing or review.`,
        link: "/clip-tracker"
      });
    }

    // 4. Clip publishing
    if (readyClips.length > 0) {
      recs.push({
        action: "Publish ready clips",
        detail: `You have ${readyClips.length} clip(s) marked 'Ready' or 'Scheduled' to post.`,
        link: "/clip-tracker"
      });
    }

    // Fallbacks
    if (recs.length === 0) {
      recs.push({
        action: "Add new topics",
        detail: "No urgent actions. Start researching and adding new ideas to the Topic Inbox.",
        link: "/topics"
      });
    }

    return recs.slice(0, 3);
  };

  const handleAddTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const result = await addTopicAction({
      pillar: fd.get("pillar")?.toString() || "Anime",
      topic: fd.get("topic")?.toString() || "",
      why_now: fd.get("why_now")?.toString() || "",
      hook_draft: fd.get("hook_draft")?.toString() || "",
      format: fd.get("format")?.toString() || "",
      source_url: fd.get("source_url")?.toString() || "",
      notes: fd.get("notes")?.toString() || "",
      freshness: parseInt(fd.get("freshness")?.toString() || "3"),
      opinion_tension: parseInt(fd.get("opinion_tension")?.toString() || "3"),
      recognition: parseInt(fd.get("recognition")?.toString() || "3"),
      participation: parseInt(fd.get("participation")?.toString() || "3"),
      status: "Inbox"
    });

    setLoading(false);
    if (result.success) {
      setTopicModal(false);
      triggerSuccessToast("Topic added successfully to Inbox!");
    }
  };

  const handleAddClip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await addClipAction({
      clip_id_code: fd.get("clip_id_code")?.toString() || "",
      recording: fd.get("recording")?.toString() || "",
      pillar: fd.get("pillar")?.toString() || "Anime",
      topic: fd.get("topic")?.toString() || "",
      hook: fd.get("hook")?.toString() || "",
      format: fd.get("format")?.toString() || "",
      owner: fd.get("owner")?.toString() || "Both",
      edit_status: fd.get("edit_status")?.toString() || "Not Started",
      platform: fd.get("platform")?.toString() || "TikTok",
      publish_status: fd.get("publish_status")?.toString() || "Not Started",
    });

    setLoading(false);
    if (result.success) {
      setClipModal(false);
      triggerSuccessToast("New clip added to Tracker!");
    }
  };

  const handleAddRec = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await addRecordingPlanAction({
      record_date: fd.get("record_date")?.toString() || "",
      episode_theme: fd.get("episode_theme")?.toString() || "",
      guest_third_mic: fd.get("guest_third_mic")?.toString() || "",
      owner: fd.get("owner")?.toString() || "Both",
      record_status: "Planning",
      long_form_target: fd.get("long_form_target")?.toString() || "",
      notes: ""
    });

    setLoading(false);
    if (result.success) {
      setRecModal(false);
      triggerSuccessToast("New Recording Cycle scheduled!");
    }
  };

  const triggerSuccessToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
      window.location.reload();
    }, 2000);
  };

  const dailyRecs = getRecommendations();

  return (
    <div>
      {/* Toast Notification */}
      {successMsg && (
        <div 
          className="alert-banner alert-success" 
          style={{ 
            position: "fixed", 
            top: "20px", 
            right: "20px", 
            zIndex: 9999, 
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            animation: "fadeIn 0.3s ease" 
          }}
        >
          <span>{successMsg}</span>
        </div>
      )}

      {/* Headline Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Command Center</h1>
        <p style={{ color: "#A1A1AA" }}>Podcasting schedule and performance snapshot at a glance.</p>
      </div>

      {/* Overdue Task Alerts */}
      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {overdueTasks.map((t, idx) => (
            <div key={idx} className="alert-banner alert-danger">
              ⚠️ <strong>Alert:</strong> {t}
            </div>
          ))}
        </div>
      )}

      {/* Countdown banner to next session */}
      {nextRecording ? (
        <div className="countdown-banner">
          <div>
            <span className="countdown-label">Next Biweekly Recording Session</span>
            <h2 style={{ fontSize: "1.5rem", marginTop: "0.25rem", color: "#FFF" }}>
              {nextRecording.episode_theme} ({nextRecording.record_date})
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="countdown-digits">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </div>
            <span className="countdown-label">Countdown until mics go hot (7:00 PM)</span>
          </div>
        </div>
      ) : (
        <div className="countdown-banner" style={{ borderStyle: "dashed", borderColor: "#26262B" }}>
          <div>
            <span className="countdown-label">No Upcoming Recordings scheduled</span>
            <h2 style={{ fontSize: "1.2rem", marginTop: "0.25rem", color: "#A1A1AA" }}>
              Schedule a biweekly Thursday session in Settings or Calendar.
            </h2>
          </div>
          <button className="btn btn-primary" onClick={() => setRecModal(true)}>
            Schedule Cycle
          </button>
        </div>
      )}

      {/* Fast Action Quick Adds */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
        <button className="btn btn-primary" onClick={() => setTopicModal(true)}>+ Add Topic</button>
        <button className="btn btn-secondary" onClick={() => setClipModal(true)}>+ Track Clip</button>
        <button className="btn btn-secondary" onClick={() => setRecModal(true)}>+ Schedule Session</button>
      </div>

      {/* Dashboard Core Grid */}
      <div className="grid-3" style={{ marginBottom: "2.5rem" }}>
        {/* Priority items - What to work on today */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <h3 className="card-title">🔥 What should we work on today?</h3>
            <span className="badge badge-orange">Top Recommendations</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {dailyRecs.map((rec, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  borderBottom: idx !== dailyRecs.length - 1 ? "1px solid #26262B" : "none",
                  paddingBottom: idx !== dailyRecs.length - 1 ? "1.25rem" : "0"
                }}
              >
                <div>
                  <h4 style={{ color: "#FFF", fontSize: "1.05rem", fontWeight: 600 }}>{rec.action}</h4>
                  <p style={{ color: "#A1A1AA", fontSize: "0.85rem", marginTop: "0.15rem" }}>{rec.detail}</p>
                </div>
                <a href={rec.link} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                  Action
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic score summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💡 Topic inbox</h3>
            <span className="badge badge-gray">{inboxCount} Unscored</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem" }}>
              Score topics based on Freshness, Opinion Tension, Recognition, and Participation.
            </p>
            {topicsWaiting.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span className="form-label" style={{ fontSize: "0.75rem" }}>Topics awaiting scoring:</span>
                {topicsWaiting.map((tw) => (
                  <div 
                    key={tw.id} 
                    style={{ 
                      fontSize: "0.85rem", 
                      padding: "0.5rem", 
                      backgroundColor: "rgba(0,0,0,0.2)", 
                      borderRadius: "6px",
                      borderLeft: "2px solid #FF5A1F" 
                    }}
                  >
                    {tw.topic}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--success)", fontSize: "0.85rem" }}>✓ All topics scored!</p>
            )}
            <a href="/topics" className="btn btn-secondary" style={{ width: "100%", fontSize: "0.85rem" }}>
              View Topic Inbox
            </a>
          </div>
        </div>
      </div>

      {/* Platform & Clip stats grid */}
      <div className="grid-3" style={{ marginBottom: "2.5rem" }}>
        {/* Followers Snapshot */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Platform Baseline</h3>
            <span className="badge badge-orange">Followers</span>
          </div>
          {channelStats ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.5rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#A1A1AA" }}>TikTok</span>
                <strong style={{ color: "#FFF" }}>{channelStats.tiktok_followers.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#A1A1AA" }}>Instagram</span>
                <strong style={{ color: "#FFF" }}>{channelStats.instagram_followers.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#A1A1AA" }}>YouTube</span>
                <strong style={{ color: "#FFF" }}>{channelStats.youtube_subscribers.toLocaleString()}</strong>
              </div>
            </div>
          ) : (
            <p style={{ color: "#A1A1AA" }}>No stats recorded.</p>
          )}
          <a href="/settings" style={{ fontSize: "0.75rem", color: "#FF5A1F", display: "inline-block", marginTop: "0.5rem" }}>
            Edit Baselines →
          </a>
        </div>

        {/* Best Performing recent clip */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👑 Best Performing Clip</h3>
            <span className="badge badge-green">Top Reach</span>
          </div>
          {bestClip ? (
            <div>
              <h4 style={{ color: "#FFF", fontSize: "1.1rem", fontFamily: "Outfit, sans-serif" }}>
                {bestClip.topic}
              </h4>
              <p style={{ color: "#FF5A1F", fontWeight: 700, fontSize: "1.3rem", marginTop: "0.25rem" }}>
                {bestClip.views.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "#A1A1AA", fontWeight: 400 }}>views ({bestClip.platform})</span>
              </p>
              <p style={{ color: "#A1A1AA", fontSize: "0.8rem", marginTop: "0.5rem", fontStyle: "italic" }}>
                "{bestClip.lesson_learned}"
              </p>
            </div>
          ) : (
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem" }}>No published clips tracked yet.</p>
          )}
        </div>

        {/* Workflows summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚙️ Clip Pipeline</h3>
            <span className="badge badge-gray">Active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#A1A1AA" }}>In Editing</span>
              <span className="badge badge-orange">{editingClips.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#A1A1AA" }}>Ready to Publish</span>
              <span className="badge badge-green">{readyClips.length}</span>
            </div>
            <a href="/clip-tracker" className="btn btn-secondary" style={{ fontSize: "0.85rem", width: "100%", marginTop: "0.5rem" }}>
              Track Clip Status
            </a>
          </div>
        </div>
      </div>

      {/* Recents list */}
      <div className="card" style={{ marginBottom: "2.5rem" }}>
        <div className="card-header">
          <h3 className="card-title">📅 Recently Published Clips</h3>
          <a href="/clip-tracker" style={{ fontSize: "0.85rem", color: "#FF5A1F" }}>All Clips →</a>
        </div>
        {recentClips.length > 0 ? (
          <div className="table-container" style={{ border: "none", marginBottom: 0 }}>
            <table className="hq-table">
              <thead>
                <tr>
                  <th>Clip ID</th>
                  <th>Platform</th>
                  <th>Pillar</th>
                  <th>Topic</th>
                  <th>Views</th>
                  <th>Engagement Rate</th>
                  <th>Lesson Learned</th>
                </tr>
              </thead>
              <tbody>
                {recentClips.map((clip) => (
                  <tr key={clip.id}>
                    <td style={{ fontWeight: 600 }}>{clip.clip_id_code}</td>
                    <td>
                      <span className={`badge ${clip.platform === "YouTube" ? "badge-red" : (clip.platform === "TikTok" ? "badge-gray" : "badge-orange")}`}>
                        {clip.platform}
                      </span>
                    </td>
                    <td>{clip.pillar}</td>
                    <td>{clip.topic}</td>
                    <td style={{ color: "#FFF", fontWeight: 600 }}>{clip.views.toLocaleString()}</td>
                    <td>{(clip.engagement_rate * 100).toFixed(2)}%</td>
                    <td style={{ color: "#A1A1AA", fontSize: "0.85rem" }}>{clip.lesson_learned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#A1A1AA", fontSize: "0.85rem" }}>No clips published recently.</p>
        )}
      </div>

      {/* MODAL 1: ADD TOPIC */}
      {topicModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setTopicModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>💡 Quick Add Topic</h3>
            <form onSubmit={handleAddTopic}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Content Pillar</label>
                  <select className="form-select" name="pillar" required>
                    <option>Anime</option>
                    <option>Hip-Hop</option>
                    <option>Concerts</option>
                    <option>Sports</option>
                    <option>Relationships</option>
                    <option>Lifestyle</option>
                    <option>Pop Culture</option>
                    <option>Community</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Format Type</label>
                  <select className="form-select" name="format" required>
                    <option>Pick a Side</option>
                    <option>Culture Court</option>
                    <option>Anime Court</option>
                    <option>One Gotta Go</option>
                    <option>Upgrade / Downgrade</option>
                    <option>Worth the Ticket?</option>
                    <option>Comment of the Week</option>
                    <option>Third Mic</option>
                    <option>Rapid Take</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic / Headline</label>
                <input className="form-input" name="topic" placeholder="e.g. Naruto vs Sasuke final valley debate" required />
              </div>

              <div className="form-group">
                <label className="form-label">Why Now / Cultural Relevance</label>
                <input className="form-input" name="why_now" placeholder="e.g. Anniversary of the episode broadcast" required />
              </div>

              <div className="form-group">
                <label className="form-label">Hook Draft</label>
                <input className="form-input" name="hook_draft" placeholder="e.g. Who made the worst decision: Naruto or Sasuke?" required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Source URL (optional)</label>
                  <input className="form-input" name="source_url" type="url" placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" name="notes" placeholder="Additional notes..." />
                </div>
              </div>

              <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px" }}>
                <span className="form-label" style={{ display: "block", marginBottom: "0.75rem" }}>Direct Scores (1-5)</span>
                <div className="grid-4">
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem", color: "#A1A1AA" }}>Freshness</label>
                    <select className="form-select" name="freshness"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem", color: "#A1A1AA" }}>Tension</label>
                    <select className="form-select" name="opinion_tension"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem", color: "#A1A1AA" }}>Recognition</label>
                    <select className="form-select" name="recognition"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.7rem", color: "#A1A1AA" }}>Participation</label>
                    <select className="form-select" name="participation"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setTopicModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add to Inbox"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CLIP */}
      {clipModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setClipModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>🎬 Track Platform Clip</h3>
            <form onSubmit={handleAddClip}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Clip ID (e.g. DRMJ-TT)</label>
                  <input className="form-input" name="clip_id_code" placeholder="DRMJ-TT" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Recording Cycle / Date</label>
                  <input className="form-input" name="recording" placeholder="June 2026 or Date" required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Pillar</label>
                  <select className="form-select" name="pillar">
                    <option>Anime</option>
                    <option>Hip-Hop</option>
                    <option>Concerts</option>
                    <option>Sports</option>
                    <option>Relationships</option>
                    <option>Lifestyle</option>
                    <option>Pop Culture</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-select" name="platform">
                    <option>TikTok</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic Description</label>
                <input className="form-input" name="topic" placeholder="e.g. Drake vs Michael Jackson" required />
              </div>

              <div className="form-group">
                <label className="form-label">Clip Hook Text</label>
                <input className="form-input" name="hook" placeholder="Does more #1 hits put Drake over MJ?" required />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Format Type</label>
                  <select className="form-select" name="format">
                    <option>Podcast reaction</option>
                    <option>Short</option>
                    <option>Pick a Side</option>
                    <option>Culture Court</option>
                    <option>Anime Court</option>
                    <option>One Gotta Go</option>
                    <option>Upgrade / Downgrade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <select className="form-select" name="owner">
                    <option>Both</option>
                    <option>Chris</option>
                    <option>6ron</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Edit Status</label>
                  <select className="form-select" name="edit_status">
                    <option>Not Started</option>
                    <option>Editing</option>
                    <option>Review</option>
                    <option>Ready</option>
                    <option>Scheduled</option>
                    <option>Published</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Publish Status</label>
                <select className="form-select" name="publish_status">
                  <option>Not Started</option>
                  <option>Scheduled</option>
                  <option>Published</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setClipModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Clip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE RECORDING */}
      {recModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setRecModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>📅 Schedule Recording Session</h3>
            <form onSubmit={handleAddRec}>
              <div className="form-group">
                <label className="form-label">Recording Date (Thursday night)</label>
                <input className="form-input" name="record_date" type="date" required />
              </div>

              <div className="form-group">
                <label className="form-label">Episode Theme / Title</label>
                <input className="form-input" name="episode_theme" placeholder="e.g. Pick a Side: Culture Edition" required />
              </div>

              <div className="form-group">
                <label className="form-label">Guest / Third Mic (optional)</label>
                <input className="form-input" name="guest_third_mic" placeholder="e.g. Female fan perspective" />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <select className="form-select" name="owner">
                    <option>Both</option>
                    <option>Chris</option>
                    <option>6ron</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Long-form Target Edit Release Date</label>
                  <input className="form-input" name="long_form_target" type="date" required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setRecModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Scheduling..." : "Schedule Cycle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
