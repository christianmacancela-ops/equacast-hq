"use client";

import { useState } from "react";
import { addTopicAction, updateTopicAction, updateRecordingPlanAction } from "@/lib/actions";

interface TopicsClientProps {
  topics: any[];
  recordingPlans: any[];
  formatsList: any[];
}

export default function TopicsClient({ topics, recordingPlans, formatsList }: TopicsClientProps) {
  // Filter states
  const [pillarFilter, setPillarFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("date_added");
  const [sortOrder, setSortOrder] = useState("desc");

  // Topic modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Forms score state for real-time preview (add form)
  const [addScores, setAddScores] = useState({ f: 3, t: 3, r: 3, p: 3 });
  // Forms score state for real-time preview (edit form)
  const [editScores, setEditScores] = useState({ f: 3, t: 3, r: 3, p: 3 });

  // Filtering topics
  const filteredTopics = topics.filter((t) => {
    if (pillarFilter !== "All" && t.pillar !== pillarFilter) return false;
    if (ownerFilter !== "All" && t.owner !== ownerFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    return true;
  });

  // Sorting topics
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleOpenEdit = (topic: any) => {
    setSelectedTopic(topic);
    setEditScores({
      f: topic.freshness,
      t: topic.opinion_tension,
      r: topic.recognition,
      p: topic.participation
    });
    setEditModal(true);
  };

  const handleOpenMove = (topic: any) => {
    setSelectedTopic(topic);
    setMoveModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    await addTopicAction({
      pillar: fd.get("pillar")?.toString() || "Anime",
      topic: fd.get("topic")?.toString() || "",
      why_now: fd.get("why_now")?.toString() || "",
      hook_draft: fd.get("hook_draft")?.toString() || "",
      format: fd.get("format")?.toString() || "",
      source_url: fd.get("source_url")?.toString() || "",
      notes: fd.get("notes")?.toString() || "",
      freshness: addScores.f,
      opinion_tension: addScores.t,
      recognition: addScores.r,
      participation: addScores.p,
      status: fd.get("status")?.toString() || "Inbox"
    });

    setLoading(false);
    setAddModal(false);
    window.location.reload();
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTopic) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    await updateTopicAction(selectedTopic.id, {
      owner: fd.get("owner")?.toString() || selectedTopic.owner,
      pillar: fd.get("pillar")?.toString() || selectedTopic.pillar,
      topic: fd.get("topic")?.toString() || selectedTopic.topic,
      why_now: fd.get("why_now")?.toString() || selectedTopic.why_now,
      hook_draft: fd.get("hook_draft")?.toString() || selectedTopic.hook_draft,
      format: fd.get("format")?.toString() || selectedTopic.format,
      freshness: editScores.f,
      opinion_tension: editScores.t,
      recognition: editScores.r,
      participation: editScores.p,
      status: fd.get("status")?.toString() || selectedTopic.status,
      source_url: fd.get("source_url")?.toString() || "",
      notes: fd.get("notes")?.toString() || ""
    });

    setLoading(false);
    setEditModal(false);
    window.location.reload();
  };

  const handleMoveToRecording = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTopic) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const recId = parseInt(fd.get("rec_id")?.toString() || "0");
    const segmentIdx = parseInt(fd.get("segment_idx")?.toString() || "0");

    const plan = recordingPlans.find((p) => p.id === recId);
    if (!plan) {
      setLoading(false);
      return;
    }

    const segments = JSON.parse(plan.segments || "[\"\",\"\",\"\",\"\",\"\"]");
    segments[segmentIdx] = selectedTopic.id.toString(); // Place topic ID

    // Update recording plan segments
    await updateRecordingPlanAction(plan.id, {
      record_date: plan.record_date,
      episode_theme: plan.episode_theme,
      guest_third_mic: plan.guest_third_mic || "",
      owner: plan.owner || "Both",
      record_status: plan.record_status || "Planning",
      long_form_target: plan.long_form_target,
      notes: plan.notes || "",
      checklist: JSON.parse(plan.checklist || "{}"),
      segments: segments
    });

    // Automatically update topic status to 'Shortlisted'
    await updateTopicAction(selectedTopic.id, {
      owner: selectedTopic.owner,
      pillar: selectedTopic.pillar,
      topic: selectedTopic.topic,
      why_now: selectedTopic.why_now,
      hook_draft: selectedTopic.hook_draft,
      format: selectedTopic.format,
      freshness: selectedTopic.freshness,
      opinion_tension: selectedTopic.opinion_tension,
      recognition: selectedTopic.recognition,
      participation: selectedTopic.participation,
      status: "Shortlisted",
      source_url: selectedTopic.source_url,
      notes: selectedTopic.notes
    });

    setLoading(false);
    setMoveModal(false);
    window.location.reload();
  };

  const addTotal = addScores.f + addScores.t + addScores.r + addScores.p;
  const addRec = addTotal >= 16 ? "RECORD" : (addTotal >= 12 ? "CONSIDER" : "PARK");

  const editTotal = editScores.f + editScores.t + editScores.r + editScores.p;
  const editRec = editTotal >= 16 ? "RECORD" : (editTotal >= 12 ? "CONSIDER" : "PARK");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Topic Inbox</h1>
          <p style={{ color: "#A1A1AA" }}>Score ideas based on criteria. Add to cycles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          + Add New Topic
        </button>
      </div>

      {/* Sorting and Filtering controls */}
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
            <option>Pop Culture</option>
            <option>Community</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#A1A1AA" }}>OWNER:</span>
          <select 
            className="form-select" 
            style={{ padding: "0.35rem 1.5rem", fontSize: "0.85rem", width: "auto" }}
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option>All</option>
            <option>Both</option>
            <option>Chris</option>
            <option>6ron</option>
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
            <option>Inbox</option>
            <option>Research</option>
            <option>Shortlisted</option>
            <option>Recorded</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginLeft: "auto" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#A1A1AA" }}>SORT BY:</span>
          <select 
            className="form-select" 
            style={{ padding: "0.35rem 1.5rem", fontSize: "0.85rem", width: "auto" }}
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="date_added">Date Added</option>
            <option value="topic">Topic Title</option>
            <option value="total_score">Total Score</option>
            <option value="pillar">Content Pillar</option>
          </select>
          <button 
            className="btn btn-secondary" 
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Topics list layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sortedTopics.length > 0 ? (
          sortedTopics.map((t) => {
            const isHigh = t.total_score >= 16;
            return (
              <div 
                key={t.id} 
                className="card" 
                style={{ 
                  borderLeft: isHigh ? "4px solid #FF5A1F" : "1px solid #26262B",
                  boxShadow: isHigh ? "0 4px 20px rgba(255, 90, 31, 0.05)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                      <span className="badge badge-orange">{t.pillar}</span>
                      <span className="badge badge-gray">{t.format}</span>
                      <span className="badge badge-gray" style={{ textTransform: "none" }}>By: {t.owner}</span>
                      <span className={`badge ${t.status === "Shortlisted" ? "badge-yellow" : (t.status === "Recorded" ? "badge-green" : "badge-gray")}`}>
                        {t.status}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: "1.25rem", color: "#FFF", fontWeight: 700, fontFamily: "Outfit, sans-serif" }}>
                      {t.topic}
                    </h3>
                    
                    <p style={{ color: "#A1A1AA", fontSize: "0.9rem", marginTop: "0.4rem" }}>
                      <strong>Why Now:</strong> {t.why_now}
                    </p>

                    <p style={{ color: "#FF5A1F", fontSize: "0.85rem", marginTop: "0.3rem", fontWeight: 600 }}>
                      🪝 Hook: "{t.hook_draft}"
                    </p>

                    {t.notes && (
                      <p style={{ color: "#52525B", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                        📝 Notes: {t.notes}
                      </p>
                    )}

                    {t.source_url && (
                      <a 
                        href={t.source_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ display: "inline-block", fontSize: "0.75rem", color: "#3B82F6", marginTop: "0.5rem" }}
                      >
                        Source URL ↗
                      </a>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", minWidth: "120px" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", color: "#A1A1AA" }}>Score:</span>
                      <span className="score-indicator high">{t.total_score}</span>
                    </div>

                    <span className={`badge ${t.recommendation === "RECORD" ? "badge-green" : (t.recommendation === "CONSIDER" ? "badge-yellow" : "badge-gray")}`}>
                      {t.recommendation === "RECORD" ? "🔥 RECORD" : t.recommendation}
                    </span>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                      <button className="btn btn-secondary" style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem" }} onClick={() => handleOpenEdit(t)}>
                        Edit
                      </button>
                      {t.status !== "Recorded" && t.status !== "Shortlisted" && (
                        <button className="btn btn-primary" style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem" }} onClick={() => handleOpenMove(t)}>
                          Send to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: "center", color: "#A1A1AA", padding: "3rem" }}>
            No topics matched your search filter criteria.
          </div>
        )}
      </div>

      {/* MODAL: ADD TOPIC */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAddModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>💡 Add Topic</h3>
            <form onSubmit={handleAddSubmit}>
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
                    {formatsList.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic / Headline</label>
                <input className="form-input" name="topic" required />
              </div>

              <div className="form-group">
                <label className="form-label">Why Now / Cultural Relevance</label>
                <input className="form-input" name="why_now" required />
              </div>

              <div className="form-group">
                <label className="form-label">Hook Draft</label>
                <input className="form-input" name="hook_draft" required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Source URL (optional)</label>
                  <input className="form-input" name="source_url" type="url" />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" name="notes" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status">
                  <option value="Inbox">Inbox (New)</option>
                  <option value="Research">Research (Prepping)</option>
                  <option value="Shortlisted">Shortlisted (Approved)</option>
                </select>
              </div>

              {/* Scoring Panel */}
              <div style={{ marginTop: "1rem", padding: "1.25rem", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span className="form-label">Calculate Scores (1-5)</span>
                  <strong style={{ color: "#FF5A1F" }}>
                    Total: {addTotal} &rarr; {addRec}
                  </strong>
                </div>
                <div className="grid-4">
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Freshness</label>
                    <select className="form-select" value={addScores.f} onChange={(e) => setAddScores({...addScores, f: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Tension</label>
                    <select className="form-select" value={addScores.t} onChange={(e) => setAddScores({...addScores, t: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Recognition</label>
                    <select className="form-select" value={addScores.r} onChange={(e) => setAddScores({...addScores, r: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Participation</label>
                    <select className="form-select" value={addScores.p} onChange={(e) => setAddScores({...addScores, p: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TOPIC */}
      {editModal && selectedTopic && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>✏️ Edit Topic & Score</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <select className="form-select" name="owner" defaultValue={selectedTopic.owner}>
                    <option>Both</option>
                    <option>Chris</option>
                    <option>6ron</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Content Pillar</label>
                  <select className="form-select" name="pillar" defaultValue={selectedTopic.pillar}>
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
              </div>

              <div className="form-group">
                <label className="form-label">Topic / Headline</label>
                <input className="form-input" name="topic" defaultValue={selectedTopic.topic} required />
              </div>

              <div className="form-group">
                <label className="form-label">Why Now / Cultural Relevance</label>
                <input className="form-input" name="why_now" defaultValue={selectedTopic.why_now} required />
              </div>

              <div className="form-group">
                <label className="form-label">Hook Draft</label>
                <input className="form-input" name="hook_draft" defaultValue={selectedTopic.hook_draft} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Source URL</label>
                  <input className="form-input" name="source_url" type="url" defaultValue={selectedTopic.source_url || ""} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" name="notes" defaultValue={selectedTopic.notes || ""} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" defaultValue={selectedTopic.status}>
                  <option value="Inbox">Inbox (New)</option>
                  <option value="Research">Research (Prepping)</option>
                  <option value="Shortlisted">Shortlisted (Approved)</option>
                  <option value="Recorded">Recorded (Done)</option>
                </select>
              </div>

              <div style={{ marginTop: "1rem", padding: "1.25rem", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <span className="form-label">Recalculate Scores</span>
                  <strong style={{ color: "#FF5A1F" }}>
                    Total: {editTotal} &rarr; {editRec}
                  </strong>
                </div>
                <div className="grid-4">
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Freshness</label>
                    <select className="form-select" value={editScores.f} onChange={(e) => setEditScores({...editScores, f: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Tension</label>
                    <select className="form-select" value={editScores.t} onChange={(e) => setEditScores({...editScores, t: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Recognition</label>
                    <select className="form-select" value={editScores.r} onChange={(e) => setEditScores({...editScores, r: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Participation</label>
                    <select className="form-select" value={editScores.p} onChange={(e) => setEditScores({...editScores, p: parseInt(e.target.value)})}>
                      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND TO CALENDAR / RECORDING PLAN */}
      {moveModal && selectedTopic && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setMoveModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>📅 Move to Recording Calendar</h3>
            <p style={{ color: "#A1A1AA", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Approve "{selectedTopic.topic}" and place it into a segment slot on an upcoming Recording Cycle.
            </p>
            <form onSubmit={handleMoveToRecording}>
              <div className="form-group">
                <label className="form-label">Select Recording Cycle</label>
                <select className="form-select" name="rec_id" required>
                  {recordingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.record_date} - {plan.episode_theme}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Slot Position (Segment)</label>
                <select className="form-select" name="segment_idx" required>
                  <option value="0">Segment 1 (Opening Hook)</option>
                  <option value="1">Segment 2</option>
                  <option value="2">Segment 3 (Middle Bracket)</option>
                  <option value="3">Segment 4</option>
                  <option value="4">Segment 5 (Viewer Comment)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setMoveModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Confirming..." : "Approve & Move"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
