# Equacast new-episode playbook

Run this every time Christian uploads a new episode. Start by reading this file, then ask for the inputs below.

## 0. What Claude can and cannot do (learned on EP. 02)
- Chat uploads are capped at 30 MB, so the full video can NOT be sent. The Google Drive connector also cannot pull a multi-GB video (it returns text/base64), and direct downloads from Drive are blocked by the container network. Do not promise to edit the video.
- Claude CAN: make the thumbnail, vertical reel cover, YouTube title/description, Instagram caption/pinned comment, chapters, posting-time advice, Shorts plan, and an edit plan (punch-in timestamps) from a small audio file + screenshots.
- Claude cannot open YouTube Studio or Instagram. Ask for screenshots.

## 1. Inputs to ask for
1. 2-3 sharp, full-resolution screenshots per person (faces visible, eyes visible, real emotion, even lighting). Frames from the G7X are best. Small/soft photos make a soft thumbnail.
2. Episode number.
3. Chapter list with timestamps (check the last timestamp against the real video length shown in YouTube Studio).
4. The episode's biggest topic / hook (what people argue about) and any topic graphic they want on the thumbnail.
5. Guest name if any ("feat." tag).
6. Screenshot of YouTube Studio > Analytics > Audience > "When your viewers are on YouTube" + Top geographies (for posting time).

## 2. Thumbnail (1280x720) - brand rules
- Style reference: `reference/ep01_thumbnail_style_reference.jpg`. Dark brown radial-glow background, orange-gradient "EQUACAST" in Anton with white stroke + black shadow, small orange "EP. NN" tag top-left, people as cutouts with white sticker outline.
- Lessons from v1 -> v4: keep the title SMALL (~840px wide, top), faces BIG, ONE strong hook (topic graphic) plus at most one short stacked callout in the top-right ("DRAKE'S 2026?"). Match lighting/warmth of both people, add an orange rim glow and a vignette. Put the hook in empty space between people. Always test readability at ~200px wide.
- Tools: `pip install pillow numpy rembg onnxruntime`. Cutout uses rembg model `u2net_human_seg` (downloads from GitHub, works through the proxy). Fonts: download Anton from `https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf` to `Anton.ttf` in the working dir.
- Scripts in `scripts/` (copied from EP. 02; edit the episode-specific values: file names, sizes, positions, callout text, EP number):
  - `cutout_people.py` - background removal for each photo
  - `make_thumbnail_horizontal.py` - 1280x720 thumbnail
  - `make_reel_cover_vertical.py` - 1080x1920 Instagram reel cover
- The topic graphic (EP. 02 used a black-on-white "FEAR OF MISSING OUT" image): convert ink to alpha, recolor yellow (255,214,0), threshold before any glow/dilate or you get a box artifact.
- Check the result by viewing the PNG before sending. Fix overlaps (people covering the title, callout hitting the title).

## 3. Vertical reel cover (1080x1920)
- Same design, stacked: title on top, topic graphic in the middle, both faces at the bottom. Keep everything important inside the center 4:5 area (y 285-1635) because the Instagram grid crops to 4:5.

## 4. YouTube title
- Formula: `<Topic hook as a question>, <second hook> | Equacast EP. NN`, under ~60 characters, hook first, show name last. Offer 2 alternates.

## 5. YouTube description
- First 2 lines = hook + keywords (shown before "Show more"). Then what else is covered, a comment question, subscribe line, CHAPTERS, social links, 3 hashtags at the end (first 3 show above the title).
- NEVER use `<` or `>` anywhere in the description (YouTube turns the box red and blocks it). Write "vs." or "bigger than" instead. This bit us on EP. 02 ("live performance > album sales").
- Chapters: first line must be `0:00`, at least 3 chapters, each >= 10 seconds, format `m:ss` (no leading zero like 01:14). Tidy capitalization, end questions with `?`.
- Keep blank lines between paragraphs when pasting.

## 6. Instagram
- Reel caption: hook line with emojis, 2-line summary, "Full episode on YouTube, link in bio", a yes/no question for comments, 6-8 hashtags.
- On-screen text for first 2 seconds: short yes/no style hook.
- Pinned comment: 3 options (debate starter, drive to YouTube, short and punchy). Post within a minute of publishing and pin it. Put the YouTube link in the bio first (links are not clickable in comments).
- Offer prepared replies to likely comments.

## 7. Posting time and promotion
- Use the Audience tab grid: publish 2-3 hours before the viewers' peak; keep one consistent day/time weekly. Default if no data: Thursday 5 pm.
- Channel data (Sep 2026): views come almost entirely from Shorts (~65.7K views/28 days, only +41 subs), long-form is rare, Drake/FOMO content performed well. So: cut 3-4 Shorts from the hottest moments of each episode, post them 1-3 days before, add the full episode as the Related video on every Short.

## 8. Output
- Save each episode's files in `episodes/epNN/` (thumbnail, vertical cover, `copy.md` with title/description/caption/pinned comment), commit and push to the session branch. Send the files to Christian with SendUserFile.

## Open items from EP. 02
- Replace `[add link]` placeholders in the description (Instagram/TikTok) with real links.
- Verify spelling of "6yron" and "Bloodhound Q50 death" in chapter titles.
