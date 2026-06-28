"use client";

import { useState } from "react";
import { addClipAction, updateClipAction } from "@/lib/actions";

interface ClipTrackerClientProps {
  clips: any[];
  formats: any[];
}

export default function ClipTrackerClient({ clips, formats }: & ClipTrackerClientProps) {
  // Filtering states
  const [platformFilter, setPlatformFilter] = useState("All");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Group clips by parent_clip_code to show connected posts
  const clipsByGroup = clips.reduce((acc: Record<string, any[]>, clip) => {
    if (clip.parent_clip_code) {
      if (!acc[clip.parent_clip_code]) acc[clip.parent_clip_code] = [];
      acc[clip.parent_clip_code].push(clip);
    }
    return acc;
  }, {});

  // Apply filters
  const filteredClips = clips.filter((c) => {
    if (platformFilter !== "All" && c.platform !== platformFilter) return false;
    if (pillarFilter !== "All" && c.pillar !== pillarFilter) return false;
    if (statusFilter !== "All" && c.edit_status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const topicMatch = c.topic?.toLowerCase().includes(q);
      const hookMatch = c.hook?.toLowerCase().includes(q);
      const idMatch = c.clip_id_code?.toLowerCase().includes(q);
      if (!topicMatch && !hookMatch && !idMatch) return false;
    }
    return true;
  });

  const handleOpenEdit = (clip: any) => {
    setSelectedClip(clip);
    setEditModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const baseCode = fd.get("clip_id_code")?.toString() || "";
    const selectedPlatforms = fd.getAll("platforms") as string[];

    // If no platform selected, default to TikTok
    const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ["TikTok"];

    // Loop and insert a record for each platform to connect them
    for (const plat of platforms) {
      const codeSuffix = plat === "TikTok" ? "TT" : (plat === "Instagram" ? "IG" : "YT");
      const fullCode = `${baseCode}-${codeSuffix}`;

      await addClipAction({
        clip_id_code: fullCode,
        recording: fd.get("recording")?.toString() || "June 2026",
        pillar: fd.get("pillar")?.toString() || "Anime",
        topic: fd.get("topic")?.toString() || "",
        hook: fd.get("hook")?.toString() || "",
        format: fd.get("format")?.toString() || "Podcast reaction",
        owner: fd.get("owner")?.toString() || "Both",
        edit_status: fd.get("edit_status")?.toString() || "Not Started",
        platform: plat,
        publish_status: fd.get("publish_status")?.toString() || "Not Started",
      });
    }

    setLoading(false);
    setAddModal(false);
    window.location.reload();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClip) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    await updateClipAction(selectedClip.id, {
      clip_id_code: fd.get("clip_id_code")?.toString() || selectedClip.clip_id_code,
      recording: fd.get("recording")?.toString() || selectedClip.recording,
      pillar: fd.get("pillar")?.toString() || selectedClip.pillar,
      topic: fd.get("topic")?.toString() || selectedClip.topic,
      hook: fd.get("hook")?.toString() || selectedClip.hook,
      format: fd.get("format")?.toString() || selectedClip.format,
      owner: fd.get("owner")?.toString() || selectedClip.owner,
      edit_status: fd.get("edit_status")?.toString() || selectedClip.edit_status,
      platform: selectedClip.platform,
      publish_status: fd.get("publish_status")?.toString() || selectedClip.publish_status,
      publish_date: fd.get("publish_date")?.toString() || selectedClip.publish_date,
      url: fd.get("url")?.toString() || selectedClip.url,
      views: parseInt(fd.get("views")?.toString() || "0"),
      likes: parseInt(fd.get("likes")?.toString() || "0"),
      comments: parseInt(fd.get("comments")?.toString() || "0"),
      shares: parseInt(fd.get("shares")?.toString() || "0"),
      saves: parseInt(fd.get("saves")?.toString() || "0"),
      avg_viewed_pct: parseFloat(fd.get("avg_viewed_pct")?.toString() || "0"),
      views_24h: parseInt(fd.get("views_24h")?.toString() || "0"),
      views_7d: parseInt(fd.get("views_7d")?.toString() || "0"),
      lesson_learned: fd.get("lesson_learned")?.toString() || selectedClip.lesson_learned
    });

    setLoading(false);
    setEditModal(false);
    window.location.reload();
  };

  // Pipeline metrics
  const totalViews = clips.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalEngagements = clips.reduce((acc, c) => acc + (c.engagements || 0), 0);
  const avgEngagementRate = clips.length > 0 ? (totalEngagements / totalViews) * 100 : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Clip Tracker</h1>
          <p style={{ color: "#A1A1AA" }}>Track social short posts across platforms. Measure engagement and feedback.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          + Track New Clip
        </button>
      </div>

      {/* Dashboard KPI Mini Cards */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.25rem" }}>
          <span className="countdown-label">Views Monitored</span>
          <h2 style={{ fontSize: "1.8rem", marginTop: "0.25rem", color: "#FF5A1F" }}>
            {totalViews.toLocaleString()}
          </h2>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <span className="countdown-label">Total Engagements</span>
          <h2 style={{ fontSize: "1.8rem", marginTop: "0.25rem", color: "#10B981" }}>
            {totalEngagements.toLocaleString()}
          </h2>
        </div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <span className="countdown-label">Average Engagement Rate</span>
          <h2 style={{ fontSize: "1.8rem", color: "#FFF", marginTop: "0.25rem" }}>
            {avgEngagementRate.toFixed(2)}%
          </h2>
        </div>
      </div>

      {/* Filter panel */}
      <div 
        className="card" 
        style={{ 
          marginBottom: "1.5rem", 
          padding: "1rem", 
          display: "flex", 
          flexWrap: "wrap", 
          gap: "1.5rem", 
          alignItems: "center" 
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#A1A1AA" }}>PLATFORM:</span>
          <select 
            className="form-select" 
            style={{ padding: "0.35rem 1.5rem", fontSize: "0.85rem", width: "auto" }}
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option>All</option>
            <option>TikTok</option>
            <option>Instagram</option>
            <option>YouTube</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#A1A1AA" }}>PILLAR:</span>
          <select 
            className="form-select" 
            style={{ padding: "0.35rem 1.5rem", fontSize: "0.85rem", width: "auto" }}
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
          >
            <option>All</option>
            <option>Anime</option>
            <option>Hip-Hop</option>
            <option>Concerts</option>
            <option>Sports</option>
            <option>Relationships</option>
            <option>Lifestyle</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#A1A1AA" }}>STATUS:</span>
          <select 
            className="form-select" 
            style={{ padding: "0.35rem 1.5rem", fontSize: "0.85rem", width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option value="Not Started">Not Started</option>
            <option value="Editing">Editing</option>
            <option value="Review">Review</option>
            <option value="Ready">Ready</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flex: 1, minWidth: "200px" }}>
          <input 
            className="form-input" 
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
            placeholder="Search topic or hook draft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main spreadsheet-like table */}
      <div className="table-container">
        <table className="hq-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Platform</th>
              <th>Pillar</th>
              <th>Topic Description</th>
              <th>Status</th>
              <th>Views</th>
              <th>Engagements</th>
              <th>Eng. Rate</th>
              <th>Retention %</th>
              <th>Connected Posts</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClips.length > 0 ? (
              filteredClips.map((clip) => {
                // Get other platform posts in same group
                const groupClips = clipsByGroup[clip.parent_clip_code] || [];
                const otherPlats = groupClips.filter((gc) => gc.platform !== clip.platform);

                return (
                  <tr key={clip.id}>
                    <td style={{ fontWeight: 600 }}>{clip.clip_id_code}</td>
                    <td>
                      <span className={`badge ${clip.platform === "YouTube" ? "badge-red" : (clip.platform === "TikTok" ? "badge-gray" : "badge-orange")}`}>
                        {clip.platform}
                      </span>
                    </td>
                    <td>{clip.pillar}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#FFF" }}>{clip.topic}</div>
                      <div style={{ fontSize: "0.75rem", color: "#A1A1AA", marginTop: "0.15rem" }}>
                        "{clip.hook}"
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        clip.edit_status === "Published" ? "badge-green" : 
                        (clip.edit_status === "Ready" || clip.edit_status === "Scheduled" ? "badge-orange" : 
                        (clip.edit_status === "Editing" || clip.edit_status === "Review" ? "badge-yellow" : "badge-gray"))
                      }`}>
                        {clip.edit_status}
                      </span>
                    </td>
                    <td style={{ color: "#FFF", fontWeight: 600 }}>
                      {clip.views ? clip.views.toLocaleString() : "0"}
                    </td>
                    <td>{clip.engagements ? clip.engagements.toLocaleString() : "0"}</td>
                    <td>{(clip.engagement_rate * 100).toFixed(2)}%</td>
                    <td>{clip.avg_viewed_pct ? `${(clip.avg_viewed_pct * 100).toFixed(1)}%` : "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {otherPlats.map((oc) => (
                          <span 
                            key={oc.id} 
                            style={{ 
                              fontSize: "0.65rem", 
                              padding: "0.1rem 0.3rem", 
                              borderRadius: "4px",
                              backgroundColor: oc.edit_status === "Published" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                              color: oc.edit_status === "Published" ? "#10B981" : "#A1A1AA",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}
                            title={`Status: ${oc.edit_status}`}
                          >
                            {oc.platform === "TikTok" ? "TT" : (oc.platform === "Instagram" ? "IG" : "YT")}
                          </span>
                        ))}
                        {otherPlats.length === 0 && <span style={{ color: "#52525B", fontSize: "0.75rem" }}>None</span>}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => handleOpenEdit(clip)}
                      >
                        Edit Stats
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} style={{ textAlign: "center", color: "#A1A1AA", padding: "2.5rem" }}>
                  No clips tracked. Click "Track New Clip" to add records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD CLIP TRACKING */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAddModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.25rem" }}>🎬 Track New Clip</h3>
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Provide the base clip code. Check multiple platforms to automatically create connected entries (e.g. base code <code>ATTACK</code> creates <code>ATTACK-TT</code>, <code>ATTACK-IG</code>, etc.).
            </p>
            <form onSubmit={handleAddSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Base Clip Code (e.g. AOT-GOAT)</label>
                  <input className="form-input" name="clip_id_code" placeholder="AOT-GOAT" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Recording Date / Cycle</label>
                  <input className="form-input" name="recording" placeholder="e.g. July 2, 2026" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Content Pillar</label>
                <select className="form-select" name="pillar">
                  <option>Anime</option>
                  <option>Hip-Hop</option>
                  <option>Concerts</option>
                  <option>Sports</option>
                  <option>Relationships</option>
                  <option>Lifestyle</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Topic Headline</label>
                <input className="form-input" name="topic" required />
              </div>

              <div className="form-group">
                <label className="form-label">Hook Draft</label>
                <input className="form-input" name="hook" required />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Format Type</label>
                  <select className="form-select" name="format">
                    {formats.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
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

              {/* Platform Checkboxes */}
              <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px", marginBottom: "1rem" }}>
                <span className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Platforms to Track</span>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" name="platforms" value="TikTok" defaultChecked style={{ accentColor: "#FF5A1F" }} /> TikTok
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" name="platforms" value="Instagram" defaultChecked style={{ accentColor: "#FF5A1F" }} /> Instagram
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input type="checkbox" name="platforms" value="YouTube" defaultChecked style={{ accentColor: "#FF5A1F" }} /> YouTube Shorts
                  </label>
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
                <button className="btn btn-secondary" type="button" onClick={() => setAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Clip Records"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLIP METRICS & STATS */}
      {editModal && selectedClip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>✏️ Edit Platform Post Performance ({selectedClip.platform})</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Clip ID Code</label>
                  <input className="form-input" name="clip_id_code" defaultValue={selectedClip.clip_id_code} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Recording</label>
                  <input className="form-input" name="recording" defaultValue={selectedClip.recording} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic Description</label>
                <input className="form-input" name="topic" defaultValue={selectedClip.topic} required />
              </div>

              <div className="form-group">
                <label className="form-label">Hook Text</label>
                <input className="form-input" name="hook" defaultValue={selectedClip.hook} required />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Format</label>
                  <input className="form-input" name="format" defaultValue={selectedClip.format} />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <select className="form-select" name="owner" defaultValue={selectedClip.owner}>
                    <option>Both</option>
                    <option>Chris</option>
                    <option>6ron</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Edit Status</label>
                  <select className="form-select" name="edit_status" defaultValue={selectedClip.edit_status}>
                    <option>Not Started</option>
                    <option>Editing</option>
                    <option>Review</option>
                    <option>Ready</option>
                    <option>Scheduled</option>
                    <option>Published</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Publish Status</label>
                  <select className="form-select" name="publish_status" defaultValue={selectedClip.publish_status}>
                    <option>Not Started</option>
                    <option>Scheduled</option>
                    <option>Published</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Publish Date</label>
                  <input className="form-input" type="date" name="publish_date" defaultValue={selectedClip.publish_date || ""} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Post URL</label>
                <input className="form-input" type="url" name="url" defaultValue={selectedClip.url || ""} />
              </div>

              {/* ANALYTICS INPUT PANEL */}
              <div style={{ marginTop: "1rem", padding: "1.25rem", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px" }}>
                <span className="form-label" style={{ display: "block", marginBottom: "0.75rem", color: "#FF5A1F" }}>Performance Metrics</span>
                <div className="grid-3">
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Views</label>
                    <input className="form-input" name="views" type="number" defaultValue={selectedClip.views || 0} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Likes</label>
                    <input className="form-input" name="likes" type="number" defaultValue={selectedClip.likes || 0} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Comments</label>
                    <input className="form-input" name="comments" type="number" defaultValue={selectedClip.comments || 0} />
                  </div>
                </div>

                <div className="grid-3" style={{ marginTop: "0.5rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Shares</label>
                    <input className="form-input" name="shares" type="number" defaultValue={selectedClip.shares || 0} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Saves</label>
                    <input className="form-input" name="saves" type="number" defaultValue={selectedClip.saves || 0} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Avg Retention % (0-1)</label>
                    <input className="form-input" name="avg_viewed_pct" type="number" step="0.001" min="0" max="1" defaultValue={selectedClip.avg_viewed_pct || 0} />
                  </div>
                </div>

                <div className="grid-2" style={{ marginTop: "0.5rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>24h Views</label>
                    <input className="form-input" name="views_24h" type="number" defaultValue={selectedClip.views_24h || 0} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>7d Views</label>
                    <input className="form-input" name="views_7d" type="number" defaultValue={selectedClip.views_7d || 0} />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label className="form-label">Lesson Learned</label>
                <textarea className="form-textarea" name="lesson_learned" defaultValue={selectedClip.lesson_learned || ""} rows={2} />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Clip Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
