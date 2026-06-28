import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = "C:/AI PROJECTS/CODEX PROJECTS/idea-lab";
const outputDir = path.join(root, "outputs", "019f0c63-c855-7220-921b-ddeb8eb076f1");
const previewDir = path.join(outputDir, "previews");
await fs.mkdir(previewDir, { recursive: true });

const wb = Workbook.create();
const dashboard = wb.worksheets.add("Dashboard");
const audit = wb.worksheets.add("Audit");
const topics = wb.worksheets.add("Topic Inbox");
const recording = wb.worksheets.add("Recording Plan");
const clips = wb.worksheets.add("Clip Tracker");
const weekly = wb.worksheets.add("Weekly Review");
const formats = wb.worksheets.add("Format Library");
const setBrand = wb.worksheets.add("Set & Brand");

const COLORS = {
  orange: "#E95A24",
  orangeDark: "#B73F16",
  black: "#171717",
  charcoal: "#292929",
  cream: "#FFF7F0",
  paleOrange: "#FCE5D8",
  yellow: "#FFF1B8",
  green: "#DDF2E5",
  greenDark: "#26734D",
  red: "#F8D7DA",
  blue: "#DCEAF7",
  gray: "#E9ECEF",
  grayText: "#5A5A5A",
  white: "#FFFFFF",
};

const titleStyle = {
  fill: COLORS.black,
  font: { bold: true, color: COLORS.white, size: 20 },
  verticalAlignment: "center",
};
const subtitleStyle = {
  fill: COLORS.black,
  font: { color: "#F8C6AD", italic: true, size: 10 },
  verticalAlignment: "center",
};
const sectionStyle = {
  fill: COLORS.orange,
  font: { bold: true, color: COLORS.white, size: 11 },
  verticalAlignment: "center",
};
const headerStyle = {
  fill: COLORS.charcoal,
  font: { bold: true, color: COLORS.white, size: 10 },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#707070" },
};
const inputStyle = {
  fill: COLORS.yellow,
  font: { color: COLORS.black },
};
const noteStyle = {
  fill: COLORS.cream,
  font: { color: COLORS.grayText, italic: true, size: 9 },
  wrapText: true,
};

function setupSheet(sheet) {
  sheet.showGridLines = false;
}

function addTitle(sheet, title, subtitle, endCol) {
  sheet.mergeCells(`A1:${endCol}1`);
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endCol}1`).format = titleStyle;
  sheet.getRange("A1").format.rowHeight = 32;
  sheet.mergeCells(`A2:${endCol}2`);
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endCol}2`).format = subtitleStyle;
  sheet.getRange("A2").format.rowHeight = 22;
}

function styleSection(sheet, range, text) {
  sheet.getRange(range).merge();
  const anchor = range.split(":")[0];
  sheet.getRange(anchor).values = [[text]];
  sheet.getRange(range).format = sectionStyle;
  sheet.getRange(anchor).format.rowHeight = 23;
}

function styleHeader(sheet, range) {
  sheet.getRange(range).format = headerStyle;
  sheet.getRange(range).format.rowHeight = 30;
}

function setWidths(sheet, widths) {
  for (const [range, width] of widths) {
    sheet.getRange(range).format.columnWidth = width;
  }
}

for (const sheet of [dashboard, audit, topics, recording, clips, weekly, formats, setBrand]) {
  setupSheet(sheet);
}

// CONTENT AUDIT
addTitle(
  audit,
  "EQUACAST CONTENT AUDIT",
  "Representative account sample reviewed June 28, 2026. Add platform exports here as the audit grows.",
  "R",
);
styleSection(audit, "A4:R4", "CURRENT PLATFORM BASELINE");
audit.getRange("A5:E5").values = [["Platform", "Metric", "Value", "Period", "Source / Note"]];
styleHeader(audit, "A5:E5");
audit.getRange("A6:E14").values = [
  ["TikTok", "Followers", 11800, "Current", "Public profile"],
  ["TikTok", "Lifetime likes", 414600, "Current", "Public profile"],
  ["Instagram", "Followers", 1635, "Current", "Public profile"],
  ["YouTube", "Subscribers", 1973, "Current", "YouTube Studio"],
  ["YouTube", "Views", 4387, "Last 28 days", "May 30-Jun 26, 2026"],
  ["YouTube", "Watch time (hours)", 20, "Last 28 days", "YouTube Studio"],
  ["YouTube", "Monthly audience", 2400, "Last 28 days", "YouTube Studio estimate"],
  ["YouTube", "Female audience share", 0.026, "Last 28 days", "Male share: 97.4%"],
  ["YouTube", "New viewer share", 0.987, "Last 28 days", "Regular viewers reported as <0.1%"],
];
audit.getRange("C6:C12").format.numberFormat = "#,##0";
audit.getRange("C13:C14").format.numberFormat = "0.0%";
audit.getRange("A6:E14").format.borders = {
  insideHorizontal: { style: "thin", color: "#DDDDDD" },
  bottom: { style: "thin", color: "#AAAAAA" },
};

styleSection(audit, "A16:R16", "SAMPLED CONTENT: BREAKOUTS, RECENT POSTS, AND CROSS-PLATFORM COMPARISONS");
const auditHeaders = [
  "Period",
  "Publish Date",
  "Platform",
  "Content",
  "Pillar",
  "Hook / Title",
  "Format",
  "Views",
  "Avg Viewed %",
  "Likes",
  "Comments",
  "Shares",
  "Saves",
  "Total Engagement",
  "Engagement Rate",
  "What Worked",
  "Improvement",
  "Source URL",
];
audit.getRange("A17:R17").values = [auditHeaders];
styleHeader(audit, "A17:R17");
const auditRows = [
  ["Historical", null, "TikTok", "Worst Work Shift", "Lifestyle", "Which shift is the WORST?", "Multiple-choice podcast clip", 2300000, null, 43500, 1696, 1532, 1888, null, null, "Universal question, visible choices, instant participation", "Turn this into a named weekly series", "https://www.tiktok.com/@equacast/video/7502135710342778142"],
  ["Historical", null, "TikTok", "Wake Up Girlfriend", "Lifestyle", "How I wake up my girlfriend", "Relatable skit", 1500000, null, null, null, null, null, null, null, "Human, visual, immediately understandable", "Translate this relatability into the current two-host brand", "https://www.tiktok.com/@equacast/video/6877210193839672581"],
  ["Historical", new Date(2021, 11, 5), "TikTok", "Hold Her Bag", "Relationships", "Fellas, how do you hold your girl's bag?", "Visual question / skit", 1100000, null, 169100, 1142, 7275, 3331, null, null, "Direct question, movement, couple context, broad appeal", "Use inclusive prompts without turning the show into dating content", "https://www.tiktok.com/@equacast/video/7038391811894709510"],
  ["Historical", new Date(2021, 2, 29), "TikTok", "Show My Son DBZ", "Anime + Lifestyle", "Me showing my son Dragon Ball Z for the first time", "Visual story / skit", 822300, null, 34100, 726, 5353, 878, null, null, "Anime connected to family and emotion", "Repeat anime-through-real-life storytelling", "https://www.tiktok.com/@equacast/video/6945185552111029509"],
  ["Historical", new Date(2023, 3, 17), "TikTok", "Drake & Weeknd AI Song", "Hip-Hop", "Drake and The Weeknd AI song reaction", "Fast trend reaction", 169200, null, 2865, 34, 190, 397, null, null, "Early reaction to a high-curiosity story", "Keep trend reactions short and publish within 24 hours", "https://www.tiktok.com/@equacast/video/7223106110801333550"],
  ["Recent", null, "TikTok", "Attack on Titan GOAT", "Anime", "Is Attack on Titan actually the greatest show ever made?", "Provocative debate", 15000, null, null, null, null, null, null, null, "Recognizable visual, bold claim, simple disagreement", "Build a recurring Anime Court series", "https://www.tiktok.com/@equacast/video/7621268522794044703"],
  ["Recent", null, "Instagram", "Bleach: This Is Your Sign", "Anime", "If you skipped Bleach, this is your sign", "Recommendation / challenge", 34600, null, null, null, null, null, null, null, "Strong fandom identity and clear promise", "Create a repeatable 'This Is Your Sign' franchise", "https://www.instagram.com/equacast/reel/DTTHK8CgFou/"],
  ["Recent", null, "Instagram", "Zoro vs Kenpachi", "Anime", "Zoro vs Kenpachi: who wins?", "Versus debate", 16000, null, null, null, null, null, null, null, "Binary choice with passionate fandoms", "Show each host's pick in the opening three seconds", "https://www.instagram.com/equacast/reel/DFG41mZu9ux/"],
  ["Recent", new Date(2026, 4, 1), "Instagram", "J. Cole Big 3", "Hip-Hop", "Did J. Cole remove himself from the Big 3?", "Debate", 8629, null, null, null, null, null, null, null, "Clear cultural disagreement", "Shorten the setup and name the opposing positions", "https://www.instagram.com/equacast/reel/DXz-cfOgPyr/"],
  ["Recent", new Date(2026, 5, 6), "TikTok", "Drake vs Michael Jackson", "Hip-Hop", "More #1 hits: does that put Drake over Michael Jackson?", "Podcast reaction", 725, null, 45, 23, 4, 6, null, null, "Good comment rate from a provocative comparison", "Open with the question; current clip begins mid-argument and runs 1:39", "https://www.tiktok.com/@equacast/video/7648312588534598943"],
  ["Recent", new Date(2026, 5, 6), "Instagram", "Drake vs Michael Jackson", "Hip-Hop", "More #1 hits: does that put Drake over Michael Jackson?", "Podcast reaction", 2631, null, null, null, null, null, null, null, "Instagram gave the same clip wider reach", "Use a consistent thumbnail label across platforms", "https://www.instagram.com/equacast/reel/DZP_-V8ArkB/"],
  ["Recent", new Date(2026, 5, 6), "YouTube", "Drake vs Michael Jackson", "Hip-Hop", "More #1 hits: does that put Drake over Michael Jackson?", "Short", 788, 0.337, 15, 5, null, null, null, null, "Typical reach, active comments", "Retention is below the channel's typical 47.4%-55.7%; cut faster", "https://www.youtube.com/shorts/omXNBDepAGw"],
  ["Recent", new Date(2026, 5, 5), "TikTok", "Drake Iceman", "Hip-Hop", "Is Iceman Drake's best project since CLB?", "Podcast reaction", 675, null, null, null, null, null, null, null, "Timely release discussion", "Replace 'our thoughts' with a viewer-facing choice", "https://www.tiktok.com/@equacast/video/7648043709086453023"],
  ["Recent", new Date(2026, 5, 5), "Instagram", "Drake Iceman", "Hip-Hop", "Is Iceman Drake's best project since CLB?", "Podcast reaction", 1994, null, null, null, null, null, null, null, "Instagram again exceeded TikTok reach", "Add a stronger first-frame verdict", "https://www.instagram.com/equacast/reel/DZOJJrBRGB5/"],
  ["Recent", new Date(2026, 5, 5), "YouTube", "Drake Iceman", "Hip-Hop", "Is Iceman Drake's best project since CLB?", "Short", 1090, 0.442, 14, 0, null, null, null, null, "Solid cross-platform baseline", "Tighten toward 50%+ average viewed", "https://www.youtube.com/shorts/tIT2z4kgmvM"],
  ["Recent", new Date(2026, 5, 5), "YouTube", "Ken Carson Flowers", "Hip-Hop", "Ken Carson replacing NBA YoungBoy: upgrade or downgrade?", "Short", 978, 0.386, 31, 1, null, null, null, null, "Specific artist/news hook", "Use the sharper upgrade-or-downgrade framing", "https://www.youtube.com/shorts/GHNLLnj6Mko"],
  ["Recent", new Date(2026, 5, 2), "YouTube", "Knicks in 4", "Sports", "Knicks in four: where does this team rank in NY history?", "Short", 1189, 0.604, 31, 5, null, null, null, null, "Best recent retention; strong local identity", "Build a recurring NY Culture / Knicks segment", "https://www.youtube.com/shorts/UhnRo3WCMG8"],
];
audit.getRange(`A18:R${17 + auditRows.length}`).values = auditRows;
for (let r = 18; r <= 17 + auditRows.length; r++) {
  audit.getRange(`N${r}`).formulas = [[`=IF(COUNTA(J${r}:M${r})=0,"",SUM(J${r}:M${r}))`]];
  audit.getRange(`O${r}`).formulas = [[`=IF(N${r}="","",IFERROR(N${r}/H${r},""))`]];
}
audit.getRange(`B18:B${17 + auditRows.length}`).format.numberFormat = "yyyy-mm-dd";
audit.getRange(`H18:H${17 + auditRows.length}`).format.numberFormat = "#,##0";
audit.getRange(`I18:I${17 + auditRows.length}`).format.numberFormat = "0.0%";
audit.getRange(`J18:N${17 + auditRows.length}`).format.numberFormat = "#,##0";
audit.getRange(`O18:O${17 + auditRows.length}`).format.numberFormat = "0.0%";
audit.getRange(`A18:R${17 + auditRows.length}`).format.wrapText = true;
audit.getRange(`A18:R${17 + auditRows.length}`).format.borders = {
  insideHorizontal: { style: "thin", color: "#E1E1E1" },
};
audit.freezePanes.freezeRows(17);
audit.freezePanes.freezeColumns(3);
setWidths(audit, [
  ["A:A", 11], ["B:B", 22], ["C:C", 11], ["D:D", 24], ["E:E", 16], ["F:F", 34],
  ["G:G", 22], ["H:H", 12], ["I:I", 12], ["J:O", 12], ["P:Q", 38], ["R:R", 44],
]);

// TOPIC INBOX
addTitle(
  topics,
  "TOPIC INBOX",
  "Drop ideas here all week. Score on Thursday before recording: Freshness + Tension + Recognition + Participation.",
  "O",
);
topics.getRange("A4:O4").values = [[
  "Added", "Owner", "Pillar", "Topic", "Why Now / Source", "Hook Draft", "Format",
  "Freshness", "Opinion Tension", "Recognition", "Participation", "Total Score",
  "Recommendation", "Status", "Source URL",
]];
styleHeader(topics, "A4:O4");
const topicRows = [
  [new Date(2026, 5, 28), "Both", "Lifestyle", "Worst work schedule", "Proven 2.3M format", "Which is worse: the 6 a.m. shift or overnight?", "Pick a Side", 3, 4, 5, 5, null, null, "Shortlisted", ""],
  [new Date(2026, 5, 28), "Both", "Anime", "Anime couple bracket", "Expands beyond battle debates", "Which anime couple would actually survive real life?", "Culture Court", 3, 4, 5, 5, null, null, "Research", ""],
  [new Date(2026, 5, 28), "Both", "Concerts", "Best live performer", "Core interest + broad participation", "You get one concert ticket: Bad Bunny, Drake, or Travis?", "Pick a Side", 4, 5, 5, 5, null, null, "Shortlisted", ""],
  [new Date(2026, 5, 28), "Chris", "Anime", "Best-written woman in anime", "Adds wider perspective authentically", "Who is the best-written woman in anime—and don't say it without proof", "Anime Court", 3, 5, 4, 5, null, null, "Research", ""],
  [new Date(2026, 5, 28), "6ron", "Hip-Hop", "Replacement artist debate", "Reusable around festivals", "The replacement was announced: upgrade or downgrade?", "Upgrade / Downgrade", 5, 5, 4, 5, null, null, "Inbox", ""],
  [new Date(2026, 5, 28), "Both", "Anime", "Big 3: one has to go", "Evergreen and familiar", "One has to go forever: Naruto, Bleach, or One Piece", "One Gotta Go", 3, 5, 5, 5, null, null, "Inbox", ""],
  [new Date(2026, 5, 28), "Both", "Concerts", "Worth the ticket?", "Makes concert coverage repeatable", "The show cost $___—was it actually worth the ticket?", "Worth the Ticket?", 4, 4, 4, 5, null, null, "Inbox", ""],
  [new Date(2026, 5, 28), "Both", "Hip-Hop", "Hits versus impact", "Builds from Drake/MJ comments", "Do number-one hits matter more than cultural impact?", "Culture Court", 3, 5, 5, 5, null, null, "Inbox", ""],
  [new Date(2026, 5, 28), "Both", "Community", "Viewer comment of the week", "Creates return behavior", "This comment started an argument in the group chat", "Comment of the Week", 4, 5, 4, 5, null, null, "Inbox", ""],
  [new Date(2026, 5, 28), "Both", "Pop Culture", "Third Mic guest perspective", "Broader voices and collaboration", "We brought in a third mic because Chris and 6ron couldn't settle this", "Third Mic", 4, 5, 4, 5, null, null, "Research", ""],
];
topics.getRange("A5:O14").values = topicRows;
for (let r = 5; r <= 64; r++) {
  topics.getRange(`L${r}`).formulas = [[`=IF(COUNTA(H${r}:K${r})=0,"",SUM(H${r}:K${r}))`]];
  topics.getRange(`M${r}`).formulas = [[`=IF(L${r}="","",IF(L${r}>=16,"RECORD",IF(L${r}>=12,"CONSIDER","PARK")))`]];
}
topics.getRange("A15:K64").format = inputStyle;
topics.getRange("N15:O64").format = inputStyle;
topics.getRange("A5:A64").format.numberFormat = "yyyy-mm-dd";
topics.getRange("H5:K64").dataValidation = { rule: { type: "whole", operator: "between", formula1: 1, formula2: 5 } };
topics.getRange("B5:B64").dataValidation = { rule: { type: "list", values: ["Chris", "6ron", "Both", "Guest"] } };
topics.getRange("C5:C64").dataValidation = { rule: { type: "list", values: ["Anime", "Hip-Hop", "Concerts", "Sports", "Gaming", "Movies", "Pop Culture", "Lifestyle", "Community"] } };
topics.getRange("G5:G64").dataValidation = { rule: { type: "list", values: ["Pick a Side", "Culture Court", "Anime Court", "One Gotta Go", "Upgrade / Downgrade", "Worth the Ticket?", "Comment of the Week", "Third Mic", "Rapid Take", "Story"] } };
topics.getRange("N5:N64").dataValidation = { rule: { type: "list", values: ["Inbox", "Research", "Shortlisted", "Recorded", "Published", "Parked"] } };
topics.getRange("L5:L64").conditionalFormats.add("colorScale", {
  colors: ["#F8D7DA", "#FFF1B8", "#DDF2E5"],
  thresholds: ["min", "50%", "max"],
});
topics.getRange("M5:M64").conditionalFormats.add("containsText", { text: "RECORD", format: { fill: COLORS.green, font: { bold: true, color: COLORS.greenDark } } });
topics.getRange("M5:M64").conditionalFormats.add("containsText", { text: "PARK", format: { fill: COLORS.red, font: { color: "#8A1C1C" } } });
topics.freezePanes.freezeRows(4);
topics.freezePanes.freezeColumns(3);
setWidths(topics, [
  ["A:A", 12], ["B:B", 11], ["C:C", 15], ["D:D", 28], ["E:E", 30], ["F:F", 42],
  ["G:G", 20], ["H:K", 13], ["L:M", 15], ["N:N", 14], ["O:O", 38],
]);
topics.getRange("A4:O64").format.wrapText = true;

// RECORDING PLAN
addTitle(
  recording,
  "RECORDING PLAN",
  "Proposed Thursday-night cycle. Adjust the dates, then lock the five segments by Wednesday evening.",
  "L",
);
styleSection(recording, "A4:L4", "BIWEEKLY THURSDAY PRODUCTION CALENDAR");
recording.getRange("A5:L5").values = [[
  "Record Date", "Cycle", "Episode Theme", "Segment 1", "Segment 2", "Segment 3",
  "Segment 4", "Segment 5", "Guest / Third Mic", "Owner", "Record Status", "Long-form Target",
]];
styleHeader(recording, "A5:L5");
const recordDates = [
  new Date(2026, 6, 2), new Date(2026, 6, 16), new Date(2026, 6, 30),
  new Date(2026, 7, 13), new Date(2026, 7, 27), new Date(2026, 8, 10),
];
const recordingRows = recordDates.map((d, idx) => [
  d,
  `Cycle ${idx + 1}`,
  idx === 0 ? "Pick a Side: Culture Edition" : "",
  idx === 0 ? "Worst work schedule" : "",
  idx === 0 ? "Best live performer" : "",
  idx === 0 ? "Anime couple bracket" : "",
  idx === 0 ? "Hits versus impact" : "",
  idx === 0 ? "Viewer comment of the week" : "",
  idx === 0 ? "Optional woman creator / fan perspective" : "",
  "Both",
  idx === 0 ? "Planning" : "Not Started",
  null,
]);
recording.getRange("A6:L11").values = recordingRows;
for (let r = 6; r <= 11; r++) {
  recording.getRange(`L${r}`).formulas = [[`=IF(A${r}="","",A${r}+3)`]];
}
for (let r = 22; r <= 35; r++) {
  recording.getRange(`L${r}`).formulas = [[`=IF(A${r}="","",A${r}+3)`]];
}
recording.getRange("A12:K13").format = inputStyle;
recording.getRange("A22:K35").format = inputStyle;
recording.getRange("A6:A13").format.numberFormat = "ddd, mmm d, yyyy";
recording.getRange("A22:A35").format.numberFormat = "ddd, mmm d, yyyy";
recording.getRange("L6:L13").format.numberFormat = "ddd, mmm d";
recording.getRange("L22:L35").format.numberFormat = "ddd, mmm d";
recording.getRange("J6:J13").dataValidation = { rule: { type: "list", values: ["Chris", "6ron", "Both"] } };
recording.getRange("J22:J35").dataValidation = { rule: { type: "list", values: ["Chris", "6ron", "Both"] } };
recording.getRange("K6:K13").dataValidation = { rule: { type: "list", values: ["Not Started", "Planning", "Ready", "Recorded", "Cancelled"] } };
recording.getRange("K22:K35").dataValidation = { rule: { type: "list", values: ["Not Started", "Planning", "Ready", "Recorded", "Cancelled"] } };
recording.getRange("K6:K13").conditionalFormats.add("containsText", { text: "Ready", format: { fill: COLORS.green, font: { bold: true } } });
recording.getRange("K6:K13").conditionalFormats.add("containsText", { text: "Planning", format: { fill: COLORS.blue } });
recording.getRange("K22:K35").conditionalFormats.add("containsText", { text: "Ready", format: { fill: COLORS.green, font: { bold: true } } });
recording.getRange("K22:K35").conditionalFormats.add("containsText", { text: "Planning", format: { fill: COLORS.blue } });
styleSection(recording, "A14:L14", "RECOMMENDED TWO-WEEK RHYTHM");
recording.getRange("A15:D21").values = [
  ["Day", "Action", "Minimum Output", "Owner"],
  ["Monday", "Add topics to inbox", "3 ideas each", "Chris + 6ron"],
  ["Wednesday", "Score and lock rundown", "5 segments + opening hooks", "Both"],
  ["Thursday night", "Record", "45-75 minute episode", "Both"],
  ["Friday", "Mark clip moments", "8 candidates", "Editor"],
  ["Weekend", "Edit and publish long-form", "1 episode + 2 shorts", "In-house"],
  ["Following week", "Release remaining clips", "2-3 shorts", "In-house"],
];
styleHeader(recording, "A15:D15");
recording.getRange("A16:D21").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };
recording.getRange("A5:L35").format.wrapText = true;
recording.freezePanes.freezeRows(5);
setWidths(recording, [
  ["A:A", 18], ["B:B", 10], ["C:C", 28], ["D:H", 26], ["I:I", 30],
  ["J:J", 11], ["K:K", 15], ["L:L", 18],
]);

// CLIP TRACKER
addTitle(
  clips,
  "CLIP TRACKER",
  "One row per platform post. The same clip posted to three platforms gets three rows so performance stays honest.",
  "W",
);
clips.getRange("A4:W4").values = [[
  "Clip ID", "Recording", "Pillar", "Topic", "Hook", "Format", "Owner", "Edit Status",
  "Platform", "Publish Status", "Publish Date", "URL", "Views", "Likes", "Comments",
  "Shares", "Saves", "Engagements", "Engagement Rate", "Avg Viewed %", "24h Views",
  "7d Views", "Lesson",
]];
styleHeader(clips, "A4:W4");
const clipSeed = [
  ["DRMJ-TT", "June 2026", "Hip-Hop", "Drake vs MJ", "Does more #1 hits put Drake over MJ?", "Podcast reaction", "Both", "Done", "TikTok", "Published", new Date(2026, 5, 6), "https://www.tiktok.com/@equacast/video/7648312588534598943", 725, 45, 23, 4, 6, null, null, null, null, null, "Good comments; weak reach and long runtime"],
  ["DRMJ-IG", "June 2026", "Hip-Hop", "Drake vs MJ", "Does more #1 hits put Drake over MJ?", "Podcast reaction", "Both", "Done", "Instagram", "Published", new Date(2026, 5, 6), "https://www.instagram.com/equacast/reel/DZP_-V8ArkB/", 2631, null, null, null, null, null, null, null, null, null, "Instagram distributed this version better"],
  ["DRMJ-YT", "June 2026", "Hip-Hop", "Drake vs MJ", "Does more #1 hits put Drake over MJ?", "Short", "Both", "Done", "YouTube", "Published", new Date(2026, 5, 6), "https://www.youtube.com/shorts/omXNBDepAGw", 788, 15, 5, null, null, null, null, 0.337, null, null, "Below typical retention; tighten the opening"],
  ["ICE-TT", "June 2026", "Hip-Hop", "Drake Iceman", "Is Iceman Drake's best project since CLB?", "Podcast reaction", "Both", "Done", "TikTok", "Published", new Date(2026, 5, 5), "https://www.tiktok.com/@equacast/video/7648043709086453023", 675, null, null, null, null, null, null, null, null, null, "Change 'our thoughts' to a direct choice"],
  ["ICE-IG", "June 2026", "Hip-Hop", "Drake Iceman", "Is Iceman Drake's best project since CLB?", "Podcast reaction", "Both", "Done", "Instagram", "Published", new Date(2026, 5, 5), "https://www.instagram.com/equacast/reel/DZOJJrBRGB5/", 1994, null, null, null, null, null, null, null, null, null, "Instagram again outperformed TikTok"],
  ["ICE-YT", "June 2026", "Hip-Hop", "Drake Iceman", "Is Iceman Drake's best project since CLB?", "Short", "Both", "Done", "YouTube", "Published", new Date(2026, 5, 5), "https://www.youtube.com/shorts/tIT2z4kgmvM", 1090, 14, 0, null, null, null, null, 0.442, null, null, "Near baseline; aim for 50%+ viewed"],
  ["KEN-YT", "June 2026", "Hip-Hop", "Ken Carson", "Replacement artist: upgrade or downgrade?", "Short", "Both", "Done", "YouTube", "Published", new Date(2026, 5, 5), "https://www.youtube.com/shorts/GHNLLnj6Mko", 978, 31, 1, null, null, null, null, 0.386, null, null, "Specific story; use sharper framing"],
  ["KNICKS-YT", "June 2026", "Sports", "Knicks in 4", "Where does this team rank in NY history?", "Short", "Both", "Done", "YouTube", "Published", new Date(2026, 5, 2), "https://www.youtube.com/shorts/UhnRo3WCMG8", 1189, 31, 5, null, null, null, null, 0.604, null, null, "Best recent retention; repeat local identity"],
];
clips.getRange("A5:W12").values = clipSeed;
for (let r = 5; r <= 64; r++) {
  clips.getRange(`R${r}`).formulas = [[`=IF(COUNTA(N${r}:Q${r})=0,"",SUM(N${r}:Q${r}))`]];
  clips.getRange(`S${r}`).formulas = [[`=IF(R${r}="","",IFERROR(R${r}/M${r},""))`]];
}
clips.getRange("A13:Q64").format = inputStyle;
clips.getRange("T13:W64").format = inputStyle;
clips.getRange("K5:K64").format.numberFormat = "yyyy-mm-dd";
clips.getRange("M5:R64").format.numberFormat = "#,##0";
clips.getRange("S5:T64").format.numberFormat = "0.0%";
clips.getRange("C5:C64").dataValidation = { rule: { type: "list", values: ["Anime", "Hip-Hop", "Concerts", "Sports", "Gaming", "Movies", "Pop Culture", "Lifestyle", "Community"] } };
clips.getRange("G5:G64").dataValidation = { rule: { type: "list", values: ["Chris", "6ron", "Both", "Guest"] } };
clips.getRange("H5:H64").dataValidation = { rule: { type: "list", values: ["Not Started", "Cutting", "Review", "Done"] } };
clips.getRange("I5:I64").dataValidation = { rule: { type: "list", values: ["TikTok", "Instagram", "YouTube"] } };
clips.getRange("J5:J64").dataValidation = { rule: { type: "list", values: ["Draft", "Scheduled", "Published", "Skipped"] } };
clips.getRange("S5:S64").conditionalFormats.add("colorScale", {
  colors: ["#F8D7DA", "#FFF1B8", "#DDF2E5"],
  thresholds: ["min", "50%", "max"],
});
clips.freezePanes.freezeRows(4);
clips.freezePanes.freezeColumns(4);
clips.getRange("A4:W64").format.wrapText = true;
setWidths(clips, [
  ["A:A", 14], ["B:B", 15], ["C:C", 14], ["D:D", 22], ["E:E", 38], ["F:F", 20],
  ["G:J", 13], ["K:K", 12], ["L:L", 42], ["M:S", 12], ["T:T", 13], ["U:V", 12], ["W:W", 38],
]);

// WEEKLY REVIEW
addTitle(
  weekly,
  "WEEKLY REVIEW",
  "Ten minutes every Sunday. Decide what to repeat, what to stop, and what the next recording must test.",
  "L",
);
weekly.getRange("A4:L4").values = [[
  "Week Start", "Week End", "Published Clips", "Total Views", "Engagements", "Avg Views / Clip",
  "Female Share", "Regular Viewer Share", "Best Clip", "Repeat", "Stop", "Test Next",
]];
styleHeader(weekly, "A4:L4");
const weekStarts = [
  new Date(2026, 5, 1), new Date(2026, 5, 8), new Date(2026, 5, 15), new Date(2026, 5, 22),
  new Date(2026, 5, 29), new Date(2026, 6, 6), new Date(2026, 6, 13), new Date(2026, 6, 20),
  new Date(2026, 6, 27), new Date(2026, 7, 3), new Date(2026, 7, 10), new Date(2026, 7, 17),
];
weekly.getRange("A5:L16").values = weekStarts.map((d) => [d, null, null, null, null, null, null, null, "", "", "", ""]);
for (let r = 5; r <= 28; r++) {
  weekly.getRange(`B${r}`).formulas = [[`=IF(A${r}="","",A${r}+6)`]];
  weekly.getRange(`C${r}`).formulas = [[`=IF(A${r}="","",COUNTIFS('Clip Tracker'!$K$5:$K$64,">="&A${r},'Clip Tracker'!$K$5:$K$64,"<="&B${r},'Clip Tracker'!$J$5:$J$64,"Published"))`]];
  weekly.getRange(`D${r}`).formulas = [[`=IF(A${r}="","",SUMIFS('Clip Tracker'!$M$5:$M$64,'Clip Tracker'!$K$5:$K$64,">="&A${r},'Clip Tracker'!$K$5:$K$64,"<="&B${r}))`]];
  weekly.getRange(`E${r}`).formulas = [[`=IF(A${r}="","",SUMIFS('Clip Tracker'!$R$5:$R$64,'Clip Tracker'!$K$5:$K$64,">="&A${r},'Clip Tracker'!$K$5:$K$64,"<="&B${r}))`]];
  weekly.getRange(`F${r}`).formulas = [[`=IF(A${r}="","",IFERROR(D${r}/C${r},0))`]];
}
weekly.getRange("A17:A28").format = inputStyle;
weekly.getRange("G5:L28").format = inputStyle;
weekly.getRange("A5:B28").format.numberFormat = "mmm d, yyyy";
weekly.getRange("C5:F28").format.numberFormat = "#,##0";
weekly.getRange("G5:H28").format.numberFormat = "0.0%";
weekly.getRange("D5:D28").conditionalFormats.add("dataBar", { color: COLORS.orange });
weekly.freezePanes.freezeRows(4);
weekly.getRange("A4:L28").format.wrapText = true;
setWidths(weekly, [
  ["A:B", 14], ["C:F", 15], ["G:H", 17], ["I:I", 25], ["J:L", 34],
]);

// FORMAT LIBRARY
addTitle(
  formats,
  "FORMAT LIBRARY",
  "Recurring names create familiarity. Use the same format often enough that viewers know what is coming.",
  "H",
);
formats.getRange("A4:H4").values = [[
  "Format", "Purpose", "Hook Formula", "Ideal Clip Length", "Cadence", "Visual Treatment", "CTA", "Proof / Note",
]];
styleHeader(formats, "A4:H4");
formats.getRange("A5:H13").values = [
  ["Pick a Side", "Maximum comments and broad reach", "You get two choices: ___ or ___?", "25-45 sec", "2x per week", "Choices onscreen before anyone speaks", "Pick one before hearing our answers", "2.3M work-shift video"],
  ["Culture Court", "Turn opinion into a repeatable show", "The case: ___. Chris says ___. 6ron says ___.", "45-75 sec", "Weekly", "Court-style title card + opposing sides", "Who won the case?", "Fits hip-hop, sports, and pop culture"],
  ["Anime Court", "Own a proven niche", "Is ___ actually the greatest ___?", "35-60 sec", "Weekly", "Character art + one bold claim", "Convince us in one sentence", "AOT 15K; Bleach 34.6K; Zoro/Kenpachi 16K"],
  ["One Gotta Go", "Evergreen debate inventory", "One disappears forever: A, B, or C", "20-40 sec", "Biweekly", "Three large recognizable images", "No fourth option", "Easy to batch-record"],
  ["Upgrade / Downgrade", "Fast reaction to replacements/news", "___ replaced ___. Upgrade or downgrade?", "20-35 sec", "As news breaks", "Before/after split image", "One word: upgrade or downgrade", "Sharper version of the Ken Carson topic"],
  ["Worth the Ticket?", "Make concerts a signature pillar", "It cost $___—was the show worth it?", "30-60 sec", "After events", "Ticket price + crowd footage + verdict", "What concert was worth every dollar?", "Natural sponsor and event path"],
  ["Comment of the Week", "Build returning viewers", "This comment started an argument", "20-45 sec", "Weekly", "Comment card onscreen", "Leave next week's question", "Turns comments into programming"],
  ["Third Mic", "Bring in wider perspectives", "We needed a third mic to settle this", "45-90 sec", "Monthly", "Guest name/title card", "Whose side are you on?", "Use recurring women creators and fans"],
  ["Rapid Take", "Win on timeliness", "This just happened—and here is the real question", "15-30 sec", "Within 24 hours", "News image + direct verdict", "Agree or overreaction?", "Historical AI-song reaction reached 169.2K"],
];
formats.getRange("A5:H13").format.wrapText = true;
formats.getRange("A5:A13").format = { fill: COLORS.paleOrange, font: { bold: true, color: COLORS.orangeDark } };
formats.getRange("A5:H13").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };
formats.freezePanes.freezeRows(4);
setWidths(formats, [
  ["A:A", 20], ["B:B", 28], ["C:C", 42], ["D:E", 15], ["F:F", 34], ["G:G", 30], ["H:H", 36],
]);

// SET & BRAND
addTitle(
  setBrand,
  "SET & BRAND PLAN",
  "The goal is recognizably Equacast, not a wall of merchandise. Keep products intentional and the frame clean.",
  "G",
);
styleSection(setBrand, "A4:G4", "CURRENT SET REVIEW");
setBrand.getRange("A5:G5").values = [[
  "Priority", "Area", "Current Observation", "Recommendation", "Budget", "Why", "Avoid",
]];
styleHeader(setBrand, "A5:G5");
setBrand.getRange("A6:G13").values = [
  ["P1", "Background", "Plain light wall; little brand memory", "Center a small Equacast logo sign and add a warm orange accent light", "Low-Med", "Makes every crop identifiable without adding clutter", "Large busy banner behind both faces"],
  ["P1", "Tabletop", "One boxed figure and a phone sit in the hero frame", "Keep the table clean; use one topic prop only when it is discussed", "Free", "Random objects look accidental; intentional props support the topic", "Several boxed products lined across the table"],
  ["P1", "Framing", "Strong two-host eye-line and clear microphones", "Keep the two-shot, then capture one close-up angle for each host", "Low-Med", "Reaction cuts improve pace and clip variety", "Cropping microphones into faces"],
  ["P1", "Lighting", "Hosts and wall are evenly lit but visually flat", "Separate hosts from wall; add soft key lights and one warm backlight", "Low-Med", "Creates depth and a more premium frame", "Colored light directly on skin"],
  ["P2", "Left shelf", "No visual anime/gaming cue", "Use 2-3 rotating pieces: anime figure, manga spine, controller", "Low", "Signals a core pillar without saying it", "A shelf packed edge-to-edge"],
  ["P2", "Right shelf", "No music/concert/sports cue", "Use vinyl, framed concert pass, and one Knicks item", "Low", "Balances the brand's culture pillars", "Unrelated logos or counterfeit-looking items"],
  ["P2", "Wardrobe", "Casual and authentic; colors sometimes blend into wall", "Keep personal style but alternate dark/light tops against the background", "Free", "Improves separation and thumbnail readability", "Tiny repeating patterns that shimmer on camera"],
  ["P3", "Brand mark", "Small corner watermark works", "Create one consistent vertical-safe watermark and thumbnail wordmark", "Low", "Recognition compounds across platforms", "Different logo placements on every clip"],
];
setBrand.getRange("A6:A13").format = { fill: COLORS.paleOrange, font: { bold: true, color: COLORS.orangeDark } };
setBrand.getRange("A6:G13").format.wrapText = true;
setBrand.getRange("A6:G13").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };

styleSection(setBrand, "A15:G15", "PRODUCT PLACEMENT RULES");
setBrand.getRange("A16:C21").values = [
  ["Situation", "Do", "Don't"],
  ["Normal episode", "Keep the table mostly clear; background collectibles may stay", "Place random boxes in the center foreground"],
  ["Sponsored product", "Show it deliberately for 5-8 seconds, name the benefit, then use a cutaway", "Let it sit silently where viewers cannot tell whether it is sponsored"],
  ["Anime topic", "Use one relevant figure, manga volume, or image as the active prop", "Display five unrelated characters at once"],
  ["Concert review", "Show ticket/pass and 1-2 seconds of permitted crowd footage", "Let shaky footage replace the hosts' verdict"],
  ["Brand outreach", "Photograph the clean set and one intentional integration example", "Send brands a frame with clutter or unrelated logos"],
];
styleHeader(setBrand, "A16:C16");
setBrand.getRange("A17:C21").format.wrapText = true;
setBrand.getRange("A17:C21").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };

styleSection(setBrand, "A23:G23", "SIMPLE SET MAP");
setBrand.getRange("A24:G29").values = [
  ["LEFT ZONE", "", "CENTER ZONE", "", "RIGHT ZONE", "", "TABLE"],
  ["Anime figure", "Manga", "EQUACAST", "logo/sign", "Vinyl", "Concert pass", "Clean"],
  ["Controller", "Warm light", "Hosts + mics", "Two-shot", "Knicks item", "Warm light", "Topic prop only"],
  ["Rotate pieces", "", "Keep logo visible", "", "Rotate pieces", "", "No phone in hero frame"],
  ["2-3 items max", "", "Orange accent", "", "2-3 items max", "", "Sponsor item only when active"],
  ["", "", "", "", "", "", ""],
];
setBrand.getRange("A24:G24").format = headerStyle;
setBrand.getRange("A25:B28").format.fill = COLORS.blue;
setBrand.getRange("C25:D28").format.fill = COLORS.paleOrange;
setBrand.getRange("E25:F28").format.fill = COLORS.green;
setBrand.getRange("G25:G28").format.fill = COLORS.yellow;
setBrand.getRange("A24:G29").format.horizontalAlignment = "center";
setBrand.getRange("A24:G29").format.verticalAlignment = "center";
setBrand.getRange("A24:G29").format.wrapText = true;
setBrand.getRange("A24:G29").format.borders = { preset: "all", style: "thin", color: "#CCCCCC" };
setWidths(setBrand, [
  ["A:A", 16], ["B:B", 22], ["C:C", 30], ["D:D", 42], ["E:E", 13], ["F:F", 33], ["G:G", 34],
]);

// DASHBOARD
addTitle(
  dashboard,
  "EQUACAST CONTENT HQ",
  "Biweekly Thursday recording system | In-house editing | Evidence-led topic planning",
  "Q",
);
styleSection(dashboard, "A4:H4", "CURRENT HEALTH SNAPSHOT · JUNE 28, 2026");

const cardRanges = [
  ["A5:B7", "TikTok Followers", 11800, "#,##0"],
  ["C5:D7", "Instagram Followers", 1635, "#,##0"],
  ["E5:F7", "YouTube Subscribers", 1973, "#,##0"],
  ["G5:H7", "YouTube Views · 28d", 4387, "#,##0"],
  ["A9:B11", "YouTube Monthly Audience", 2400, "#,##0"],
  ["C9:D11", "Female Audience · YouTube", 0.026, "0.0%"],
  ["E9:F11", "New Viewer Share · YouTube", 0.987, "0.0%"],
  ["G9:H11", "Regular Viewers · YouTube", "<0.1%", "@"],
];
for (const [range, label, value, numberFormat] of cardRanges) {
  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = Number(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  dashboard.getRange(`${startCol}${startRow}:${endCol}${startRow}`).merge();
  dashboard.getRange(`${startCol}${startRow}`).values = [[label]];
  dashboard.getRange(`${startCol}${startRow}:${endCol}${startRow}`).format = {
    fill: COLORS.charcoal,
    font: { bold: true, color: COLORS.white, size: 9 },
    horizontalAlignment: "center",
  };
  dashboard.getRange(`${startCol}${startRow + 1}:${endCol}${startRow + 2}`).merge();
  dashboard.getRange(`${startCol}${startRow + 1}`).values = [[value]];
  dashboard.getRange(`${startCol}${startRow + 1}:${endCol}${startRow + 2}`).format = {
    fill: COLORS.cream,
    font: { bold: true, color: COLORS.orangeDark, size: 18 },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    numberFormat,
    borders: { preset: "outside", style: "thin", color: "#D6B39F" },
  };
}

styleSection(dashboard, "A13:H13", "NEXT OPERATING CYCLE");
dashboard.getRange("A14:H20").values = [
  ["When", "Action", "Output", "Definition of Done", "", "", "", ""],
  ["Mon-Wed", "Collect + score topics", "10 ideas → 5 segments", "Every segment has a viewer-facing hook", "", "", "", ""],
  ["Thursday night", "Record", "45-75 minute episode", "Five segments; each starts with a clean question", "", "", "", ""],
  ["Friday", "Mark clip moments", "8 candidates", "Timecode, hook, platform, and owner entered", "", "", "", ""],
  ["Weekend", "Edit + publish", "1 long-form + 2 shorts", "No dead air before the hook", "", "", "", ""],
  ["Following week", "Release + review", "2-3 more shorts", "Sunday review completed before next topic lock", "", "", "", ""],
  ["Target cadence", "Every two weeks", "4-5 short posts per cycle", "Consistency beats volume spikes", "", "", "", ""],
];
styleHeader(dashboard, "A14:D14");
dashboard.getRange("A15:D20").format.wrapText = true;
dashboard.getRange("A15:D20").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };

styleSection(dashboard, "A22:H22", "FIRST 30-DAY PRIORITIES");
dashboard.getRange("A23:H28").values = [
  ["1", "Launch Pick a Side", "Use a visible question and choices before the first spoken sentence", "Owner: Both", "", "", "", ""],
  ["2", "Build return behavior", "Name recurring formats and run Comment of the Week every cycle", "Measure: regular viewers", "", "", "", ""],
  ["3", "Broaden the room", "Add recurring women creators/fans through Third Mic and wider culture intersections", "Measure: female audience share", "", "", "", ""],
  ["4", "Shorten weak cuts", "Default to 25-60 seconds unless the interaction itself earns longer runtime", "Measure: average viewed %", "", "", "", ""],
  ["5", "Make the set recognizable", "Logo + orange accent + two curated shelves; clean tabletop", "Measure: visual consistency", "", "", "", ""],
  ["6", "Clean YouTube identity", "Rename display from Equa to Equacast and rebuild the banner safe area/home layout", "Measure: subscriber conversion", "", "", "", ""],
];
dashboard.getRange("A23:A28").format = {
  fill: COLORS.orange,
  font: { bold: true, color: COLORS.white, size: 13 },
  horizontalAlignment: "center",
};
dashboard.getRange("B23:D28").format.wrapText = true;
dashboard.getRange("A23:D28").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };

dashboard.getRange("J4:M4").values = [["Recent Clip", "TikTok", "Instagram", "YouTube"]];
styleHeader(dashboard, "J4:M4");
dashboard.getRange("J5:M9").values = [
  ["Drake vs MJ", 725, 2631, 788],
  ["Iceman", 675, 1994, 1090],
  ["Ken Carson", 666, 986, 978],
  ["Knicks in 4", 588, 1548, 1189],
  ["J. Cole Big 3", 891, 8629, null],
];
dashboard.getRange("K5:M9").format.numberFormat = "#,##0";
dashboard.getRange("J5:M9").format.borders = { insideHorizontal: { style: "thin", color: "#DDDDDD" } };
const chart = dashboard.charts.add("bar", dashboard.getRange("J4:M9"));
chart.title = "Recent Clip Reach by Platform";
chart.hasLegend = true;
chart.yAxis = { numberFormatCode: "#,##0" };
chart.setPosition("J11", "Q28");

dashboard.getRange("J30:Q33").merge();
dashboard.getRange("J30").values = [[
  "CORE FINDING: The breakout pattern is a simple, visible question that lets viewers participate immediately. "
  + "The current bottleneck is not production quality; it is repeatability, retention, and converting discovery into habit."
]];
dashboard.getRange("J30:Q33").format = {
  fill: COLORS.paleOrange,
  font: { bold: true, color: COLORS.orangeDark, size: 11 },
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "outside", style: "medium", color: COLORS.orange },
};

dashboard.getRange("A30:H32").merge();
dashboard.getRange("A30").values = [[
  "Yellow cells across the workbook are inputs. Start in Topic Inbox, lock the Recording Plan on Wednesday, "
  + "track each platform post in Clip Tracker, and use Weekly Review every Sunday."
]];
dashboard.getRange("A30:H32").format = noteStyle;
dashboard.freezePanes.freezeRows(2);
setWidths(dashboard, [
  ["A:A", 10], ["B:B", 24], ["C:C", 30], ["D:D", 30], ["E:H", 13], ["I:I", 3],
  ["J:J", 18], ["K:M", 13], ["N:Q", 12],
]);

// Final table styling and row sizing
for (const sheet of [audit, topics, recording, clips, weekly, formats, setBrand]) {
  const used = sheet.getUsedRange();
  used.format.verticalAlignment = "top";
}

// Compact checks before export
const dashboardCheck = await wb.inspect({
  kind: "table",
  range: "Dashboard!A1:Q33",
  include: "values,formulas",
  tableMaxRows: 35,
  tableMaxCols: 18,
});
console.log(dashboardCheck.ndjson);

const errorScan = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errorScan.ndjson);

for (const sheetName of [
  "Dashboard", "Audit", "Topic Inbox", "Recording Plan",
  "Clip Tracker", "Weekly Review", "Format Library", "Set & Brand",
]) {
  const preview = await wb.render({
    sheetName,
    autoCrop: "all",
    scale: sheetName === "Dashboard" ? 1.2 : 1,
    format: "png",
  });
  await fs.writeFile(
    path.join(previewDir, `${sheetName.replaceAll(" ", "_")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const xlsx = await SpreadsheetFile.exportXlsx(wb);
const outputPath = path.join(outputDir, "Equacast_Content_HQ.xlsx");
await xlsx.save(outputPath);
console.log(`SAVED ${outputPath}`);
