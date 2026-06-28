import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const revalidate = 0;

export default async function FormatLibraryPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch formats list
  const formats = await query("SELECT * FROM formats ORDER BY id ASC");

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Format Library</h1>
        <p style={{ color: "#A1A1AA" }}>Standardized episode segments designed for audience retention and comment interactions.</p>
      </div>

      <div className="grid-2" style={{ gap: "2rem" }}>
        {formats.map((fmt) => (
          <div 
            key={fmt.id} 
            className="card" 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between", 
              minHeight: "280px" 
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.4rem", color: "#FFF", fontFamily: "Outfit, sans-serif" }}>{fmt.name}</h3>
                <span className="badge badge-orange">{fmt.cadence}</span>
              </div>

              <p style={{ color: "#FF5A1F", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>
                🎯 Purpose: <span style={{ color: "#F4F4F6", fontWeight: 500 }}>{fmt.purpose}</span>
              </p>

              <div 
                style={{ 
                  padding: "0.85rem", 
                  backgroundColor: "rgba(0,0,0,0.25)", 
                  borderLeft: "3px solid #FF5A1F", 
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  color: "#FF8A50",
                  marginBottom: "1.25rem" 
                }}
              >
                🪝 Hook Formula:<br />
                <span style={{ color: "#FFF" }}>{fmt.hook_formula}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "#A1A1AA" }}>
                <div>⏱️ <strong>Ideal Length:</strong> {fmt.ideal_length}</div>
                <div>🎬 <strong>Visual Treatment:</strong> {fmt.visual_treatment}</div>
                <div>📣 <strong>Call to Action:</strong> {fmt.cta}</div>
              </div>
            </div>

            <div 
              style={{ 
                marginTop: "1.5rem", 
                paddingTop: "1rem", 
                borderTop: "1px solid #26262B",
                fontSize: "0.8rem",
                color: "#52525B" 
              }}
            >
              📊 <strong>Historical Proof:</strong> {fmt.proof_note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
