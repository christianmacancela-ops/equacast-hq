"use client";

import { useState } from "react";
import { updateRecordingPlanAction, addRecordingPlanAction } from "@/lib/actions";

interface RecordingPlanClientProps {
  recordingPlans: any[];
  topicsMap: Record<number, any>;
  unslottedTopics: any[];
}

export default function RecordingPlanClient({
  recordingPlans,
  topicsMap,
  unslottedTopics
}: RecordingPlanClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Trigger checkbox update via action
  const handleCheckToggle = async (plan: any, key: string, val: boolean) => {
    const checklist = JSON.parse(plan.checklist || "{}");
    checklist[key] = val;
    
    // Auto update status if "Episode recorded" checkbox is toggled
    let recordStatus = plan.record_status;
    if (key === "episode_recorded") {
      recordStatus = val ? "Recorded" : "Planning";
    }

    const segments = JSON.parse(plan.segments || "[\"\",\"\",\"\",\"\",\"\"]");

    await updateRecordingPlanAction(plan.id, {
      record_date: plan.record_date,
      episode_theme: plan.episode_theme,
      guest_third_mic: plan.guest_third_mic || "",
      owner: plan.owner || "Both",
      record_status: recordStatus,
      long_form_target: plan.long_form_target,
      notes: plan.notes || "",
      checklist: checklist,
      segments: segments
    });
    
    window.location.reload();
  };

  const handleOpenEdit = (plan: any) => {
    setSelectedPlan(plan);
    setEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const checklist = JSON.parse(selectedPlan.checklist || "{}");
    
    const segments = [
      fd.get("seg_0")?.toString() || "",
      fd.get("seg_1")?.toString() || "",
      fd.get("seg_2")?.toString() || "",
      fd.get("seg_3")?.toString() || "",
      fd.get("seg_4")?.toString() || ""
    ];

    await updateRecordingPlanAction(selectedPlan.id, {
      record_date: fd.get("record_date")?.toString() || selectedPlan.record_date,
      episode_theme: fd.get("episode_theme")?.toString() || selectedPlan.episode_theme,
      guest_third_mic: fd.get("guest_third_mic")?.toString() || "",
      owner: fd.get("owner")?.toString() || "Both",
      record_status: fd.get("record_status")?.toString() || "Planning",
      long_form_target: fd.get("long_form_target")?.toString() || selectedPlan.long_form_target,
      notes: fd.get("notes")?.toString() || "",
      checklist: checklist,
      segments: segments
    });

    setLoading(false);
    setEditModal(false);
    window.location.reload();
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    await addRecordingPlanAction({
      record_date: fd.get("record_date")?.toString() || "",
      episode_theme: fd.get("episode_theme")?.toString() || "",
      guest_third_mic: fd.get("guest_third_mic")?.toString() || "",
      owner: fd.get("owner")?.toString() || "Both",
      record_status: "Planning",
      long_form_target: fd.get("long_form_target")?.toString() || "",
      notes: ""
    });

    setLoading(false);
    setAddModal(false);
    window.location.reload();
  };

  const checklistKeys = [
    { key: "topics_locked", label: "Topics Locked" },
    { key: "hooks_written", label: "Hooks Written" },
    { key: "research_complete", label: "Research Complete" },
    { key: "equipment_ready", label: "Equipment Ready" },
    { key: "guest_confirmed", label: "Guest Confirmed" },
    { key: "episode_recorded", label: "Episode Recorded" },
    { key: "clip_moments_marked", label: "Clip Moments Marked" },
    { key: "long_form_edit_complete", label: "Long-form Edit Complete" },
    { key: "shorts_prepared", label: "Shorts Prepared" },
    { key: "content_published", label: "Content Published" }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Recording Plan</h1>
          <p style={{ color: "#A1A1AA" }}>Biweekly Thursday production schedules, slatted rundowns, and checkmarks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          + Schedule New Cycle
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {recordingPlans.map((plan) => {
          const checklist = JSON.parse(plan.checklist || "{}");
          const segmentIds = JSON.parse(plan.segments || "[\"\",\"\",\"\",\"\",\"\"]");
          
          // Count completed items
          const completedCount = checklistKeys.filter((k) => checklist[k.key]).length;

          return (
            <div key={plan.id} className="card" style={{ padding: "2rem" }}>
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  borderBottom: "1px solid #26262B",
                  paddingBottom: "1.25rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span className="badge badge-orange">{plan.cycle}</span>
                    <span className={`badge ${plan.record_status === "Recorded" ? "badge-green" : "badge-yellow"}`}>
                      {plan.record_status}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#A1A1AA" }}>Lead: {plan.owner}</span>
                  </div>
                  <h2 style={{ fontSize: "1.6rem", color: "#FFF", fontFamily: "Outfit, sans-serif" }}>
                    {plan.episode_theme}
                  </h2>
                  <p style={{ color: "#A1A1AA", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    🎙️ <strong>Recording:</strong> Thursday, {plan.record_date} @ 7:00 PM | 🎬 <strong>Long-form release target:</strong> {plan.long_form_target}
                  </p>
                  {plan.guest_third_mic && (
                    <p style={{ color: "#FF5A1F", fontSize: "0.85rem", marginTop: "0.25rem", fontWeight: 600 }}>
                      👥 Guest / Third Mic: {plan.guest_third_mic}
                    </p>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", color: "#A1A1AA", marginBottom: "0.5rem" }}>
                    Production Progress: <strong>{completedCount} / 10</strong>
                  </div>
                  <div 
                    style={{ 
                      width: "120px", 
                      height: "8px", 
                      backgroundColor: "rgba(0,0,0,0.3)", 
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginLeft: "auto"
                    }}
                  >
                    <div 
                      style={{ 
                        width: `${completedCount * 10}%`, 
                        height: "100%", 
                        backgroundColor: completedCount === 10 ? "#10B981" : "#FF5A1F",
                        transition: "width 0.3s ease"
                      }}
                    />
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", marginTop: "1rem" }}
                    onClick={() => handleOpenEdit(plan)}
                  >
                    Manage Rundown
                  </button>
                </div>
              </div>

              {/* Grid split: Left Slated segments, Right Checklist */}
              <div className="grid-2">
                {/* Slated Segments List */}
                <div>
                  <h3 className="form-label" style={{ marginBottom: "1rem", display: "block" }}>Slated Segments</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {segmentIds.map((sid: string, idx: number) => {
                      const topicId = parseInt(sid);
                      const topic = topicId && topicsMap[topicId];
                      
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            padding: "0.75rem", 
                            backgroundColor: "rgba(0,0,0,0.15)", 
                            borderRadius: "8px",
                            borderLeft: topic ? "3px solid #FF5A1F" : "3px dashed #52525B"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FF5A1F" }}>
                              SEGMENT {idx + 1}
                            </span>
                            {topic && (
                              <span className="badge badge-gray" style={{ fontSize: "0.65rem" }}>
                                {topic.format}
                              </span>
                            )}
                          </div>

                          {topic ? (
                            <div style={{ marginTop: "0.25rem" }}>
                              <strong style={{ color: "#FFF", fontSize: "0.95rem" }}>{topic.topic}</strong>
                              <p style={{ color: "#A1A1AA", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                                🪝 Hook: "{topic.hook_draft}"
                              </p>
                            </div>
                          ) : (
                            <div style={{ color: "#52525B", fontSize: "0.85rem", marginTop: "0.25rem", fontStyle: "italic" }}>
                              Unassigned. Go to Topic Inbox or edit rundown to slotted.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Checklist widget */}
                <div>
                  <h3 className="form-label" style={{ marginBottom: "1rem", display: "block" }}>Production Checklist</h3>
                  <div 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr", 
                      gap: "0.75rem",
                      padding: "1rem",
                      backgroundColor: "rgba(0,0,0,0.1)",
                      borderRadius: "8px" 
                    }}
                  >
                    {checklistKeys.map((item) => (
                      <label 
                        key={item.key} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "0.5rem", 
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          color: checklist[item.key] ? "#FFF" : "#A1A1AA"
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{
                            accentColor: "#FF5A1F",
                            width: "16px",
                            height: "16px"
                          }}
                          checked={!!checklist[item.key]}
                          onChange={(e) => handleCheckToggle(plan, item.key, e.target.checked)}
                        />
                        <span style={{ textDecoration: checklist[item.key] ? "line-through" : "none" }}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {plan.notes && (
                    <div style={{ marginTop: "1rem", padding: "0.75rem", border: "1px solid #26262B", borderRadius: "8px" }}>
                      <span className="form-label" style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>Notes</span>
                      <p style={{ fontSize: "0.85rem", color: "#A1A1AA" }}>{plan.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: EDIT RECORDING PLAN & ASSIGN SEGMENTS */}
      {editModal && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "650px" }}>
            <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>✏️ Edit Production Cycle Rundown</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Record Date</label>
                  <input className="form-input" type="date" name="record_date" defaultValue={selectedPlan.record_date} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Long-form Target Release</label>
                  <input className="form-input" type="date" name="long_form_target" defaultValue={selectedPlan.long_form_target} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Episode Theme / Theme Topic</label>
                <input className="form-input" name="episode_theme" defaultValue={selectedPlan.episode_theme} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Guest / Third Mic</label>
                  <input className="form-input" name="guest_third_mic" defaultValue={selectedPlan.guest_third_mic || ""} />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner</label>
                  <select className="form-select" name="owner" defaultValue={selectedPlan.owner || "Both"}>
                    <option>Both</option>
                    <option>Chris</option>
                    <option>6ron</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Recording Status</label>
                <select className="form-select" name="record_status" defaultValue={selectedPlan.record_status}>
                  <option>Planning</option>
                  <option>Recorded</option>
                  <option>Not Started</option>
                </select>
              </div>

              {/* Segment Slot Assignments */}
              <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "8px" }}>
                <span className="form-label" style={{ display: "block", marginBottom: "0.75rem" }}>Slated Segments</span>
                
                {[0, 1, 2, 3, 4].map((idx) => {
                  const segmentIds = JSON.parse(selectedPlan.segments || "[\"\",\"\",\"\",\"\",\"\"]");
                  const currentAssigned = segmentIds[idx];
                  
                  return (
                    <div key={idx} className="grid-2" style={{ alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "#FF5A1F", fontWeight: 700 }}>Segment {idx + 1}</span>
                      <select className="form-select" name={`seg_${idx}`} defaultValue={currentAssigned}>
                        <option value="">-- Leave Empty / Unslotted --</option>
                        {/* Currently slotted in this position */}
                        {currentAssigned && topicsMap[parseInt(currentAssigned)] && (
                          <option value={currentAssigned}>
                            [Slotted] {topicsMap[parseInt(currentAssigned)].topic} ({topicsMap[parseInt(currentAssigned)].pillar})
                          </option>
                        )}
                        {/* Show unslotted and inbox/shortlisted topics */}
                        {unslottedTopics.map((ut) => (
                          <option key={ut.id} value={ut.id.toString()}>
                            {ut.topic} ({ut.pillar})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label className="form-label">Cycle Production Notes</label>
                <textarea className="form-textarea" name="notes" defaultValue={selectedPlan.notes || ""} rows={3} />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Rundown"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD RECORDING PLAN */}
      {addModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setAddModal(false)}>×</button>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>📅 Schedule Recording cycle</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Recording Date (Thursday)</label>
                <input className="form-input" type="date" name="record_date" required />
              </div>

              <div className="form-group">
                <label className="form-label">Episode Theme / Theme Headline</label>
                <input className="form-input" name="episode_theme" placeholder="e.g. Pick a Side: Anime Edition" required />
              </div>

              <div className="form-group">
                <label className="form-label">Guest / Third Mic (optional)</label>
                <input className="form-input" name="guest_third_mic" placeholder="e.g. Guest name" />
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
                  <label className="form-label">Long-form target edit release date</label>
                  <input className="form-input" type="date" name="long_form_target" required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" type="button" onClick={() => setAddModal(false)}>Cancel</button>
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
