import sqlite3
import json
import os
import hashlib

db_file = r"c:\AI PROJECTS\ANTIGRAVITY PROJECTS\equa-cast-hq\local.db"
seed_json = r"C:\Users\chris\.gemini\antigravity\brain\bdf6ad8d-9ccf-4bdd-a5b2-1d65e476315a\scratch\clean_seed_data.json"

print("Seeding SQLite DB:", db_file)

if os.path.exists(db_file):
    os.remove(db_file)
    print("Removed existing DB file.")

conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# 1. Create tables
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    display_name TEXT,
    role TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_added TEXT,
    owner TEXT,
    pillar TEXT,
    topic TEXT,
    why_now TEXT,
    hook_draft TEXT,
    format TEXT,
    freshness INTEGER,
    opinion_tension INTEGER,
    recognition INTEGER,
    participation INTEGER,
    total_score INTEGER,
    recommendation TEXT,
    status TEXT,
    source_url TEXT,
    notes TEXT,
    last_edited_by TEXT,
    updated_at TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS recording_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT,
    cycle TEXT,
    episode_theme TEXT,
    guest_third_mic TEXT,
    owner TEXT,
    record_status TEXT,
    long_form_target TEXT,
    notes TEXT,
    checklist TEXT, -- JSON string
    segments TEXT, -- JSON string list of 5 segment topics
    last_edited_by TEXT,
    updated_at TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clip_id_code TEXT UNIQUE,
    recording TEXT,
    pillar TEXT,
    topic TEXT,
    hook TEXT,
    format TEXT,
    owner TEXT,
    edit_status TEXT,
    platform TEXT,
    publish_status TEXT,
    publish_date TEXT,
    url TEXT,
    views INTEGER,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER,
    saves INTEGER,
    engagements INTEGER,
    engagement_rate REAL,
    avg_viewed_pct REAL,
    views_24h INTEGER,
    views_7d INTEGER,
    lesson_learned TEXT,
    parent_clip_code TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS weekly_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT,
    week_end TEXT,
    published_clips INTEGER,
    total_views INTEGER,
    engagements INTEGER,
    female_share REAL,
    regular_viewer_share REAL,
    best_clip TEXT,
    repeat_notes TEXT,
    stop_notes TEXT,
    test_next_notes TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS formats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    purpose TEXT,
    hook_formula TEXT,
    ideal_length TEXT,
    cadence TEXT,
    visual_treatment TEXT,
    cta TEXT,
    proof_note TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS set_review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    priority TEXT,
    area TEXT,
    current_observation TEXT,
    recommendation TEXT,
    budget TEXT,
    why TEXT,
    avoid TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS product_placement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    situation TEXT,
    do_rule TEXT,
    dont_rule TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS baselines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT,
    metric TEXT,
    value REAL,
    period TEXT,
    note TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS priorities (
    id TEXT PRIMARY KEY,
    action TEXT,
    output TEXT,
    measure_owner TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS operating_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    when_time TEXT,
    action TEXT,
    output TEXT,
    definition_of_done TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    user TEXT,
    action TEXT,
    details TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS channel_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tiktok_followers INTEGER,
    instagram_followers INTEGER,
    youtube_subscribers INTEGER,
    youtube_views_28d INTEGER,
    youtube_monthly_audience INTEGER,
    youtube_female_share REAL,
    youtube_new_viewer_share REAL,
    youtube_regular_viewer_share REAL,
    updated_at TEXT
)
""")

# Load seed JSON
with open(seed_json, "r", encoding="utf-8") as f:
    seed_data = json.load(f)

# Helper for secure pass hashing: sha256(password + salt)
SALT = "equacast_salt_2026"
def hash_pass(pwd):
    return hashlib.sha256((pwd + SALT).encode('utf-8')).hexdigest()

# Add users
users = [
    ("chris", hash_pass("chris123"), "Chris", "admin"),
    ("byron", hash_pass("byron123"), "Byron / 6ron", "host")
]
cursor.executemany("INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)", users)

# Add formats
for f in seed_data["formats"]:
    cursor.execute("""
    INSERT INTO formats (name, purpose, hook_formula, ideal_length, cadence, visual_treatment, cta, proof_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (f["name"], f["purpose"], f["hook_formula"], f["ideal_length"], f["cadence"], f["visual_treatment"], f["cta"], f["proof_note"]))

# Add topics
for t in seed_data["topics"]:
    total_score = t["freshness"] + t["opinion_tension"] + t["recognition"] + t["participation"]
    rec = "RECORD" if total_score >= 16 else ("CONSIDER" if total_score >= 12 else "PARK")
    cursor.execute("""
    INSERT INTO topics (date_added, owner, pillar, topic, why_now, hook_draft, format, freshness, opinion_tension, recognition, participation, total_score, recommendation, status, source_url, notes, last_edited_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (t["date_added"], t["owner"], t["pillar"], t["topic"], t["why_now"], t["hook_draft"], t["format"], t["freshness"], t["opinion_tension"], t["recognition"], t["participation"], total_score, rec, t["status"], t["source_url"], t["notes"], "System Seed", "2026-06-28"))

# Add recording plans
for rp in seed_data["recording_plans"]:
    checklist_init = {
        "topics_locked": False,
        "hooks_written": False,
        "research_complete": False,
        "equipment_ready": False,
        "guest_confirmed": False,
        "episode_recorded": rp["record_status"] == "Recorded",
        "clip_moments_marked": False,
        "long_form_edit_complete": False,
        "shorts_prepared": False,
        "content_published": False
    }
    cursor.execute("""
    INSERT INTO recording_plans (record_date, cycle, episode_theme, guest_third_mic, owner, record_status, long_form_target, notes, checklist, segments, last_edited_by, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (rp["record_date"], rp["cycle"], rp["episode_theme"], rp["guest_third_mic"], rp["owner"], rp["record_status"], rp["long_form_target"], rp["notes"], json.dumps(checklist_init), json.dumps(rp["segments"]), "System Seed", "2026-06-28"))

# Add clips
for c in seed_data["clips"]:
    engagements = c["likes"] + c["comments"] + c["shares"] + c["saves"]
    eng_rate = engagements / c["views"] if c["views"] > 0 else 0
    # extract parent code (e.g., DRMJ from DRMJ-TT)
    parent_code = c["clip_id_code"].split("-")[0] if "-" in c["clip_id_code"] else c["clip_id_code"]
    cursor.execute("""
    INSERT INTO clips (clip_id_code, recording, pillar, topic, hook, format, owner, edit_status, platform, publish_status, publish_date, url, views, likes, comments, shares, saves, engagements, engagement_rate, avg_viewed_pct, views_24h, views_7d, lesson_learned, parent_clip_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (c["clip_id_code"], c["recording"], c["pillar"], c["topic"], c["hook"], c["format"], c["owner"], c["edit_status"], c["platform"], c["publish_status"], c["publish_date"], c["url"], c["views"], c["likes"], c["comments"], c["shares"], c["saves"], engagements, eng_rate, c["avg_viewed_pct"], c["views_24h"], c["views_7d"], c["lesson_learned"], parent_code))

# Add weekly reviews
for wr in seed_data["weekly_reviews"]:
    cursor.execute("""
    INSERT INTO weekly_reviews (week_start, week_end, published_clips, total_views, engagements, female_share, regular_viewer_share, best_clip, repeat_notes, stop_notes, test_next_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (wr["week_start"], wr["week_end"], wr["published_clips"], wr["total_views"], wr["engagements"], wr["female_share"], wr["regular_viewer_share"], wr["best_clip"], wr["repeat_notes"], wr["stop_notes"], wr["test_next_notes"]))

# Add set reviews
for sr in seed_data["set_review"]:
    cursor.execute("""
    INSERT INTO set_review (priority, area, current_observation, recommendation, budget, why, avoid)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (sr["priority"], sr["area"], sr["current_observation"], sr["recommendation"], sr["budget"], sr["why"], sr["avoid"]))

# Add product placement rules
for pp in seed_data["product_placement"]:
    cursor.execute("""
    INSERT INTO product_placement (situation, do_rule, dont_rule)
    VALUES (?, ?, ?)
    """, (pp["situation"], pp["do_rule"], pp["dont_rule"]))

# Add baselines
for b in seed_data["baselines"]:
    cursor.execute("""
    INSERT INTO baselines (platform, metric, value, period, note)
    VALUES (?, ?, ?, ?, ?)
    """, (b["platform"], b["metric"], b["value"], b["period"], b["note"]))

# Add priorities
for p in seed_data["priorities"]:
    cursor.execute("""
    INSERT INTO priorities (id, action, output, measure_owner)
    VALUES (?, ?, ?, ?)
    """, (p["id"], p["action"], p["output"], p["measure_owner"]))

# Add operating cycles
for oc in seed_data["operating_cycles"]:
    cursor.execute("""
    INSERT INTO operating_cycles (when_time, action, output, definition_of_done)
    VALUES (?, ?, ?, ?)
    """, (oc["when"], oc["action"], oc["output"], oc["definition_of_done"]))

# Add initial stats
cursor.execute("""
INSERT INTO channel_stats (tiktok_followers, instagram_followers, youtube_subscribers, youtube_views_28d, youtube_monthly_audience, youtube_female_share, youtube_new_viewer_share, youtube_regular_viewer_share, updated_at)
VALUES (11800, 1635, 1973, 4387, 2400, 0.026, 0.987, 0.001, '2026-06-28')
""")

conn.commit()
conn.close()

print("Database seeding completed successfully.")
