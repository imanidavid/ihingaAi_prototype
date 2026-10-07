---
name: ihinga-media-prompts
description: How to handle every image or video in the IHINGA AI prototype without generating or downloading media — write a named entry with a ready-to-paste Gemini image (or Veo video) prompt in docs/media-manifest.md and reference the planned file path in code with a safe fallback. Use this skill whenever a page needs a photo, hero image, card image, thumbnail, illustration, background, poster or video, or when the user mentions images, pictures, photos, Gemini, Imagen, Veo or video.
---

# Media for IHINGA AI (prompts, not generation)

Claude does not generate or download images or video for this project. The user generates
them in Gemini and drops them into `public/media/` with the exact filename from the manifest.

## Steps
1. Decide if media is allowed here (see "Where media is allowed"). If not, use an icon instead.
2. Add a row to `docs/media-manifest.md` (keep the table format):
   `| filename | type | where used | size / aspect | alt text | Gemini prompt | status |`
   - filename: kebab-case, prefixed by role or area, e.g. `coop-hero-potato-field.jpg`.
   - status starts as `needed`.
3. In code, reference `/media/<filename>` and render a fallback if the file is missing:
   a tint (`#E4ECDB`) block with a centred Lucide icon — never a broken image or alt text.
4. Mention the new manifest rows in your task summary.

## Where media is allowed
- Images: hero banners (role dashboards, sign-in panel), photo cards (advisories, training
  materials), observation thumbnails, cooperative/group cards if needed.
- Video: ONLY the sign-in left panel background loop and training material previews.
  Never in dashboards, tables, charts or drawers (distracting, heavy, not graded).

## Image prompt template (fill in the subject)
"Photorealistic photograph, [SUBJECT], in the volcanic highlands of Musanze District,
northern Rwanda, Virunga volcanoes softly visible in the background, terraced hillside
fields, natural soft daylight, calm atmosphere, colour palette dominated by deep and soft
greens, [ASPECT] composition with empty space on the [LEFT/RIGHT] for text, no text,
no logos, no watermarks, no recognisable faces in close-up."

Rules: people only at a distance or from behind, working respectfully; real Rwandan crops
(Irish potato, climbing beans with stakes, maize, wheat, pyrethrum); no tractors or
large-scale machinery (smallholder context).

Sizes: hero 1600×600 (8:3, empty space left); photo card 800×500 (16:10);
thumbnail 400×400 (1:1); sign-in panel 1200×1600 (3:4).

## Video prompt template (Veo)
"Seamless 8-second looping cinematic shot, [SUBJECT] in the volcanic highlands of Musanze,
Rwanda, slow gentle camera drift, morning mist over terraced fields, soft natural light,
deep green colour grade, no people in close-up, no text, no logos, no fast motion."
Export: 1920×1080 MP4 (H.264), muted, ≤ 4 MB, plus a poster JPG with the same name.
In code: `<video autoplay muted loop playsinline poster=...>` with the image fallback.
