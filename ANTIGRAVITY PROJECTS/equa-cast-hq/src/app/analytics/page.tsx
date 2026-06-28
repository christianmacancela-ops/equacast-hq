import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Fetch all published clips for dynamic aggregate calculations
  const clips = await query("SELECT * FROM clips WHERE edit_status = 'Published'");

  // 2. Fetch baseline statistics
  const baseStatsRows = await query("SELECT * FROM channel_stats WHERE id = 1");
  const currentStats = baseStatsRows[0] || {
    tiktok_followers: 11800,
    instagram_followers: 1635,
    youtube_subscribers: 1973,
    youtube_views_28d: 4387,
    youtube_monthly_audience: 2400,
    youtube_female_share: 0.026,
    youtube_new_viewer_share: 0.987,
    youtube_regular_viewer_share: 0.001
  };

  // Aggregates by Platform
  const platformStats: Record<string, { views: number; engagements: number; count: number; retentionSum: number; retentionCount: number }> = {
    TikTok: { views: 0, engagements: 0, count: 0, retentionSum: 0, retentionCount: 0 },
    Instagram: { views: 0, engagements: 0, count: 0, retentionSum: 0, retentionCount: 0 },
    YouTube: { views: 0, engagements: 0, count: 0, retentionSum: 0, retentionCount: 0 }
  };

  // Aggregates by Pillar
  const pillarStats: Record<string, { views: number; engagements: number; count: number; retentionSum: number; retentionCount: number }> = {};

  // Aggregates by Format
  const formatStats: Record<string, { views: number; engagements: number; count: number }> = {};

  clips.forEach((c) => {
    // Platform aggregation
    if (platformStats[c.platform]) {
      platformStats[c.platform].views += c.views || 0;
      platformStats[c.platform].engagements += c.engagements || 0;
      platformStats[c.platform].count += 1;
      if (c.avg_viewed_pct > 0) {
        platformStats[c.platform].retentionSum += c.avg_viewed_pct;
        platformStats[c.platform].retentionCount += 1;
      }
    }

    // Pillar aggregation
    const pillar = c.pillar || "Other";
    if (!pillarStats[pillar]) {
      pillarStats[pillar] = { views: 0, engagements: 0, count: 0, retentionSum: 0, retentionCount: 0 };
    }
    pillarStats[pillar].views += c.views || 0;
    pillarStats[pillar].engagements += c.engagements || 0;
    pillarStats[pillar].count += 1;
    if (c.avg_viewed_pct > 0) {
      pillarStats[pillar].retentionSum += c.avg_viewed_pct;
      pillarStats[pillar].retentionCount += 1;
    }

    // Format aggregation
    const fmt = c.format || "Other";
    if (!formatStats[fmt]) {
      formatStats[fmt] = { views: 0, engagements: 0, count: 0 };
    }
    formatStats[fmt].views += c.views || 0;
    formatStats[fmt].engagements += c.engagements || 0;
    formatStats[fmt].count += 1;
  });

  // Calculate insights
  const insights: string[] = [];

  // Insight 1: Highest performing pillar by average views
  let bestPillarName = "";
  let maxAvgPillarViews = -1;
  Object.entries(pillarStats).forEach(([pName, pStat]) => {
    const avg = pStat.views / pStat.count;
    if (avg > maxAvgPillarViews) {
      maxAvgPillarViews = avg;
      bestPillarName = pName;
    }
  });
  if (bestPillarName) {
    insights.push(`🔥 **${bestPillarName}** topics are driving the highest audience discovery, averaging **${Math.round(maxAvgPillarViews).toLocaleString()}** views per post.`);
  }

  // Insight 2: Best retention
  let bestRetentionPillar = "";
  let maxRetentionVal = -1;
  Object.entries(pillarStats).forEach(([pName, pStat]) => {
    if (pStat.retentionCount > 0) {
      const avgRet = pStat.retentionSum / pStat.retentionCount;
      if (avgRet > maxRetentionVal) {
        maxRetentionVal = avgRet;
        bestRetentionPillar = pName;
      }
    }
  });
  if (bestRetentionPillar) {
    insights.push(`🎯 Audience retention is strongest in **${bestRetentionPillar}** videos, which keep viewers hooked for an average of **${(maxRetentionVal * 100).toFixed(1)}%** of the runtime.`);
  }

  // Insight 3: Instagram vs TikTok reach
  if (platformStats.Instagram.views > 0 && platformStats.TikTok.views > 0) {
    const avgIG = platformStats.Instagram.views / platformStats.Instagram.count;
    const avgTT = platformStats.TikTok.views / platformStats.TikTok.count;
    if (avgIG > avgTT) {
      insights.push(`📈 Instagram Reels are outperforming TikTok in distribution, averaging **${Math.round(avgIG).toLocaleString()}** views compared to TikTok's **${Math.round(avgTT).toLocaleString()}**.`);
    } else if (avgTT > avgIG) {
      insights.push(`📈 TikTok is outperforming Instagram Reels in distribution, averaging **${Math.round(avgTT).toLocaleString()}** views compared to Instagram's **${Math.round(avgIG).toLocaleString()}**.`);
    }
  }

  // Fallback insight
  if (insights.length === 0) {
    insights.push("💡 Start publishing and tracking posts in Clip Tracker to generate dynamic performance recommendations.");
  }

  // Sort pillars by views for graph visualization
  const sortedPillars = Object.entries(pillarStats)
    .map(([name, data]) => ({ name, ...data, avgViews: data.views / data.count }))
    .sort((a, b) => b.views - a.views);

  const maxPillarViews = sortedPillars.length > 0 ? Math.max(...sortedPillars.map(p => p.views)) : 1;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.2rem", color: "#F4F4F6", fontFamily: "Outfit, sans-serif" }}>Analytics</h1>
        <p style={{ color: "#A1A1AA" }}>Dynamic cross-platform analysis of Equacast short-form distribution.</p>
      </div>

      {/* Dynamic Insights Panel */}
      <div className="card" style={{ marginBottom: "2.5rem", borderLeft: "4px solid #FF5A1F", background: "linear-gradient(90deg, #18181C 0%, rgba(255, 90, 31, 0.03) 100%)" }}>
        <h3 className="card-title" style={{ color: "#FF5A1F", marginBottom: "1rem" }}>💡 Content Insights</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
          {insights.map((insight, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </div>
      </div>

      {/* Grid: Platform Views & Platform Engagement */}
      <div className="grid-2" style={{ marginBottom: "2.5rem" }}>
        {/* Platform Views */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.5rem" }}>Views by Platform</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {Object.entries(platformStats).map(([plat, stat]) => {
              const maxVal = Math.max(...Object.values(platformStats).map(p => p.views), 1);
              const pct = (stat.views / maxVal) * 100;
              return (
                <div key={plat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600 }}>{plat}</span>
                    <span style={{ color: "#FFF" }}>{stat.views.toLocaleString()} views</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #FF5A1F, #FF8A50)", borderRadius: "6px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Engagement Rates */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.5rem" }}>Average Engagement Rate</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {Object.entries(platformStats).map(([plat, stat]) => {
              const rate = stat.views > 0 ? (stat.engagements / stat.views) * 100 : 0;
              // Normalizing max height based on a typical high engagement rate of 15%
              const pct = Math.min((rate / 15) * 100, 100);
              return (
                <div key={plat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600 }}>{plat}</span>
                    <span style={{ color: "#FFF" }}>{rate.toFixed(2)}%</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #10B981, #34D399)", borderRadius: "6px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Pillars & Formats */}
      <div className="grid-2" style={{ marginBottom: "2.5rem" }}>
        {/* Performance by Content Pillar */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.5rem" }}>Views by Content Pillar</h3>
          {sortedPillars.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {sortedPillars.map((p) => {
                const pct = (p.views / maxPillarViews) * 100;
                return (
                  <div key={p.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600 }}>{p.name} ({p.count} posts)</span>
                      <span style={{ color: "#FFF" }}>{p.views.toLocaleString()} views</span>
                    </div>
                    <div style={{ width: "100%", height: "12px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #FF5A1F, #FF8A50)", borderRadius: "6px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#A1A1AA" }}>No data to display.</p>
          )}
        </div>

        {/* Performance by format */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.5rem" }}>Performance by Format</h3>
          {Object.keys(formatStats).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {Object.entries(formatStats).map(([fName, fStat]) => {
                const maxVal = Math.max(...Object.values(formatStats).map(f => f.views), 1);
                const pct = (fStat.views / maxVal) * 100;
                return (
                  <div key={fName}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600 }}>{fName}</span>
                      <span style={{ color: "#FFF" }}>{fStat.views.toLocaleString()} views</span>
                    </div>
                    <div style={{ width: "100%", height: "12px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: "6px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#A1A1AA" }}>No format data to display.</p>
          )}
        </div>
      </div>

      {/* Grid: Demographics, growth baseline, and new/returning splits */}
      <div className="grid-3" style={{ marginBottom: "2.5rem" }}>
        {/* Growth vs Baseline */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>Subscribers & Followers</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ borderBottom: "1px solid #26262B", paddingBottom: "0.5rem" }}>
              <span className="countdown-label">TikTok Followers</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#FFF" }}>
                {currentStats.tiktok_followers.toLocaleString()}
              </div>
            </div>
            <div style={{ borderBottom: "1px solid #26262B", paddingBottom: "0.5rem" }}>
              <span className="countdown-label">Instagram Followers</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#FFF" }}>
                {currentStats.instagram_followers.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="countdown-label">YouTube Subscribers</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#FFF" }}>
                {currentStats.youtube_subscribers.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* New vs Returning split */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>YouTube Viewer Habits</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "0.5rem 0" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>New Viewers</span>
                <strong style={{ color: "#FFF" }}>{(currentStats.youtube_new_viewer_share * 100).toFixed(1)}%</strong>
              </div>
              <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${currentStats.youtube_new_viewer_share * 100}%`, height: "100%", backgroundColor: "#FF5A1F" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>Returning Viewers</span>
                <strong style={{ color: "#FFF" }}>{(currentStats.youtube_regular_viewer_share * 100).toFixed(1)}%</strong>
              </div>
              <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${currentStats.youtube_regular_viewer_share * 100}%`, height: "100%", backgroundColor: "#10B981" }} />
              </div>
            </div>
            <p style={{ color: "#52525B", fontSize: "0.75rem", fontStyle: "italic" }}>
              Bottleneck: New discovery is strong, but returning habit is extremely low (&lt;0.1%).
            </p>
          </div>
        </div>

        {/* Gender share split */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: "1.25rem" }}>YouTube Audience Gender</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "0.5rem 0" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>Male Audience Share</span>
                <strong style={{ color: "#FFF" }}>{((1 - currentStats.youtube_female_share) * 100).toFixed(1)}%</strong>
              </div>
              <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${(1 - currentStats.youtube_female_share) * 100}%`, height: "100%", backgroundColor: "#3B82F6" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>Female Audience Share</span>
                <strong style={{ color: "#FFF" }}>{(currentStats.youtube_female_share * 100).toFixed(1)}%</strong>
              </div>
              <div style={{ width: "100%", height: "10px", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${currentStats.youtube_female_share * 100}%`, height: "100%", backgroundColor: "#EC4899" }} />
              </div>
            </div>
            <p style={{ color: "#52525B", fontSize: "0.75rem", fontStyle: "italic" }}>
              Goal: Broaden the room to invite women fans/creators using Third Mic and broader cultural intersections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
