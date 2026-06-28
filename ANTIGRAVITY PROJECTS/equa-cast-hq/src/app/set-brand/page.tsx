import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const revalidate = 0;

export default async function SetBrandPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch guidelines lists
  const reviews = await query("SELECT * FROM set_review");
  const placements = await query("SELECT * FROM product_placement");

  return (
    <div>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Set & Brand</h1>
        <p style={{ color: "#A1A1AA" }}>Studio layout guidelines, wardrobe choices, and sponsor product placement rules.</p>
      </div>

      {/* Grid: Set Review on Left, Placement Rules on Right */}
      <div className="grid-2" style={{ gap: "2.5rem", alignItems: "start", marginBottom: "2.5rem" }}>
        {/* Current Set Review Checklist */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>📹 Studio Set Review & Fixes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {reviews.map((rev) => (
              <div 
                key={rev.id} 
                style={{ 
                  padding: "1rem", 
                  backgroundColor: "rgba(0,0,0,0.15)", 
                  borderLeft: `3px solid ${rev.priority === "P1" ? "#EF4444" : (rev.priority === "P2" ? "#F59E0B" : "#A1A1AA")}`, 
                  borderRadius: "6px" 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <strong style={{ color: "#FFF", fontSize: "0.95rem" }}>{rev.area}</strong>
                  <span className={`badge ${rev.priority === "P1" ? "badge-red" : (rev.priority === "P2" ? "badge-yellow" : "badge-gray")}`}>
                    {rev.priority}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#A1A1AA" }}>
                  <p style={{ margin: "0.2rem 0" }}>🔍 <strong>Observation:</strong> {rev.current_observation}</p>
                  <p style={{ margin: "0.2rem 0", color: "#F4F4F6" }}>🚀 <strong>Recommendation:</strong> {rev.recommendation}</p>
                  <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "#FF5A1F" }}>💡 <strong>Why:</strong> {rev.why}</p>
                  <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "#EF4444" }}>⚠️ <strong>Avoid:</strong> {rev.avoid}</p>
                  <span style={{ fontSize: "0.75rem", display: "inline-block", marginTop: "0.4rem", padding: "0.1rem 0.4rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
                    Budget: {rev.budget}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Placement Rules */}
        <div>
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>👔 Product Placement Rules</h3>
            <div className="table-container" style={{ border: "none", marginBottom: 0 }}>
              <table className="hq-table">
                <thead>
                  <tr>
                    <th>Context / Situation</th>
                    <th style={{ color: "#10B981" }}>DO</th>
                    <th style={{ color: "#EF4444" }}>DON'T</th>
                  </tr>
                </thead>
                <tbody>
                  {placements.map((rule) => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 600, color: "#FFF" }}>{rule.situation}</td>
                      <td style={{ color: "#A7F3D0", fontSize: "0.85rem" }}>✓ {rule.do_rule}</td>
                      <td style={{ color: "#FCA5A5", fontSize: "0.85rem" }}>✗ {rule.dont_rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Structured Set Map Blueprint */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>📐 Studio Physical Set Map</h3>
            <div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1.2fr 1fr", 
                gap: "0.75rem",
                textAlign: "center",
                fontSize: "0.85rem"
              }}
            >
              {/* Left Zone */}
              <div style={{ border: "1px solid #26262B", padding: "1rem", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                <span className="form-label" style={{ color: "#FF5A1F" }}>Left Shelf</span>
                <p style={{ color: "#FFF", fontWeight: 600, marginTop: "0.5rem" }}>Anime Figure</p>
                <p style={{ color: "#A1A1AA", fontSize: "0.8rem" }}>Manga Spine</p>
                <p style={{ color: "#A1A1AA", fontSize: "0.8rem" }}>Gaming Controller</p>
                <span style={{ fontSize: "0.7rem", color: "#52525B", display: "block", marginTop: "0.5rem" }}>
                  (Rotate 2-3 items max)
                </span>
              </div>

              {/* Center Zone */}
              <div style={{ border: "2px solid #FF5A1F", padding: "1rem", borderRadius: "8px", backgroundColor: "rgba(255,90,31,0.02)" }}>
                <span className="form-label" style={{ color: "#FFF" }}>Center Background</span>
                <p style={{ color: "#FF5A1F", fontWeight: 800, fontSize: "1.1rem", marginTop: "0.5rem" }}>EQUACAST Logo</p>
                <p style={{ color: "#FFF", fontSize: "0.8rem" }}>Warm Orange Accent Light</p>
                <p style={{ color: "#A1A1AA", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  Hosts Two-Shot Frame
                </p>
              </div>

              {/* Right Zone */}
              <div style={{ border: "1px solid #26262B", padding: "1rem", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                <span className="form-label" style={{ color: "#FF5A1F" }}>Right Shelf</span>
                <p style={{ color: "#FFF", fontWeight: 600, marginTop: "0.5rem" }}>Vinyl Records</p>
                <p style={{ color: "#A1A1AA", fontSize: "0.8rem" }}>Knicks Memorabilia</p>
                <p style={{ color: "#A1A1AA", fontSize: "0.8rem" }}>Concert Tickets/Passes</p>
                <span style={{ fontSize: "0.7rem", color: "#52525B", display: "block", marginTop: "0.5rem" }}>
                  (No counterfeit items)
                </span>
              </div>

              {/* Foreground Table Zone */}
              <div style={{ gridColumn: "span 3", border: "1px solid #26262B", padding: "1rem", borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.2)" }}>
                <span className="form-label" style={{ color: "#A1A1AA" }}>Table Foreground</span>
                <p style={{ color: "#FFF", marginTop: "0.25rem" }}>
                  Keep Table Completely Clean
                </p>
                <p style={{ color: "#FF5A1F", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Display sponsor product/topic prop ONLY when active in conversation. No random phones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
