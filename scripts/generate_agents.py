"""
Generate matching artwork for agents that have no image yet.

Uses existing agents in public/agents/ as style references, asks Gemini for a
new character on plain white, removes the background, and normalises the
result to the same 408x612 transparent PNG format as the originals.

Drafts are written to scripts/agent-drafts/ for review — they are NOT copied
into public/ automatically.

Usage:
    set GEMINI_API_KEY first (setx GEMINI_API_KEY "...")
    python scripts/generate_agents.py                 # all missing agents
    python scripts/generate_agents.py buddy milli     # specific agents
    python scripts/generate_agents.py --process      # clean up images saved by hand into agent-drafts/
"""

import io
import os
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REF_DIR = ROOT / "public" / "agents"
OUT_DIR = Path(__file__).resolve().parent / "agent-drafts"

CANVAS = (408, 612)
TARGET_HEIGHT = 590  # figure height in px, matches originals (~580-600)

# Models tried in order until one works for this API key.
MODELS = ["gemini-3.1-flash-image", "gemini-3-pro-image", "gemini-2.5-flash-image"]

STYLE = (
    "Create ONE new character in exactly the same art style as the reference images: "
    "a stylised 3D animated-film character render (Pixar-like), big expressive eyes, smooth skin, "
    "soft studio lighting, full body from head to shoes, standing upright facing the viewer, "
    "centered, the whole figure visible with a little space around it. "
    "Business-professional outfit in the same palette as the references (black or dark navy suit, white shirt, black tie or neat blouse). "
    "Plain pure white background (#FFFFFF), no floor, no shadow on the ground, no text, no logo, no other characters. "
    "Portrait orientation. The character must be clearly a different person from the references."
)

AGENTS = {
    "buddy": {
        "refs": ["dexter", "cassie"],
        "desc": "Buddy, a business strategist: a man in his late 40s, short dark hair greying at the temples, "
        "neat short beard, warm confident smile, holding a tablet under one arm, charcoal suit with a dark red tie.",
    },
    "milli": {
        "refs": ["cassie", "soshie"],
        "desc": "Milli, a sales strategist: a woman in her early 30s with a sleek black high ponytail, "
        "confident friendly smile, wearing a slim wireless headset microphone, fitted black blazer and trousers, one hand on hip.",
    },
    "seomi": {
        "refs": ["emmie", "gigi"],
        "desc": "Seomi, an SEO specialist: a young East-Asian woman with a shoulder-length bob haircut and "
        "round black glasses, curious smile, holding a closed silver laptop against her side, black blazer and pencil skirt.",
    },
    "commet": {
        "refs": ["dexter", "penn"],
        "desc": "Commet, an eCommerce specialist: a young man in his late 20s with curly dark hair and light stubble, "
        "cheerful grin, holding a small brown shipping parcel in both hands, black suit with an open collar white shirt.",
    },
    "scouty": {
        "refs": ["gigi", "cassie"],
        "desc": "Scouty, a recruiter: a woman in her 30s with long wavy auburn hair, warm welcoming smile, "
        "holding a clipboard with papers, navy blazer and skirt, white blouse.",
    },
    "vizzy": {
        "refs": ["dexter", "soshie"],
        "desc": "Vizzy, a virtual assistant: a friendly young man in his mid 20s with a neat side-part light brown hair, "
        "bright smile, holding a black leather planner notebook, slim black suit, white shirt, thin black tie.",
    },
}


def remove_white_background(img: Image.Image, tol: int = 28) -> Image.Image:
    """Flood-fill from the borders so only background white becomes transparent
    (white shirts inside the figure are preserved), then soften the edge."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    def is_bg(p):
        r, g, b, _ = p
        return r >= 255 - tol and g >= 255 - tol and b >= 255 - tol

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.extend([(x, 0), (x, h - 1)])
    for y in range(h):
        q.extend([(0, y), (w - 1, y)])

    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        if x > 0:
            q.append((x - 1, y))
        if x < w - 1:
            q.append((x + 1, y))
        if y > 0:
            q.append((x, y - 1))
        if y < h - 1:
            q.append((x, y + 1))

    # Soften: near-white pixels touching transparency get partial alpha (reduces halo).
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if any(px[nx, ny][3] == 0 for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))):
                lum = (r + g + b) / 3
                if lum > 200:
                    px[x, y] = (r, g, b, int(255 * (255 - lum) / 55))
    return img


def normalise(img: Image.Image) -> Image.Image:
    """Crop to the figure and place it bottom-centred on a 408x612 canvas."""
    bbox = img.getchannel("A").getbbox()
    fig = img.crop(bbox)
    scale = min(TARGET_HEIGHT / fig.height, (CANVAS[0] - 40) / fig.width)
    fig = fig.resize((round(fig.width * scale), round(fig.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - fig.width) // 2
    y = CANVAS[1] - fig.height - 6
    canvas.alpha_composite(fig, (x, y))
    return canvas


def generate(client, agent_id: str) -> Path:
    from google.genai import types

    spec = AGENTS[agent_id]
    refs = []
    for r in spec["refs"]:
        ref = Image.open(REF_DIR / f"{r}.png").convert("RGBA")
        bg = Image.new("RGBA", ref.size, (255, 255, 255, 255))
        bg.alpha_composite(ref)
        refs.append(bg.convert("RGB"))

    prompt = f"{STYLE}\n\nThe new character: {spec['desc']}"
    last_err = None
    for model in MODELS:
        try:
            resp = client.models.generate_content(
                model=model,
                contents=[*refs, prompt],
                config=types.GenerateContentConfig(response_modalities=["IMAGE"]),
            )
            for part in resp.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    raw = Image.open(io.BytesIO(part.inline_data.data))
                    OUT_DIR.mkdir(exist_ok=True)
                    raw.save(OUT_DIR / f"{agent_id}.raw.png")
                    final = normalise(remove_white_background(raw))
                    out = OUT_DIR / f"{agent_id}.png"
                    final.save(out, optimize=True)
                    print(f"  {agent_id}: ok ({model})")
                    return out
            last_err = RuntimeError(f"{model} returned no image")
        except Exception as e:  # try the next model
            last_err = e
            print(f"  {agent_id}: {model} failed -> {str(e)[:160]}")
    raise last_err


def contact_sheet(paths):
    """One review image: each draft next to the others on a dark card, like the site."""
    cell_w, cell_h = CANVAS
    sheet = Image.new("RGB", (cell_w * len(paths), cell_h), (10, 10, 11))
    for i, p in enumerate(paths):
        sheet.paste(Image.open(p), (i * cell_w, 0), Image.open(p))
    out = OUT_DIR / "_review_sheet.png"
    sheet.save(out)
    return out


def process_manual():
    """Clean up images saved by hand (e.g. from the Gemini app) as
    scripts/agent-drafts/<id>.png|jpg|jpeg|webp -> agent-drafts/processed/<id>.png"""
    out_dir = OUT_DIR / "processed"
    out_dir.mkdir(parents=True, exist_ok=True)
    done = []
    for agent_id in AGENTS:
        src = next((OUT_DIR / f"{agent_id}.{ext}" for ext in ("png", "jpg", "jpeg", "webp") if (OUT_DIR / f"{agent_id}.{ext}").exists()), None)
        if not src:
            print(f"  {agent_id}: no file yet")
            continue
        img = Image.open(src)
        # Already transparent? keep alpha, otherwise strip the white background.
        has_alpha = img.mode == "RGBA" and img.getchannel("A").getextrema()[0] < 255
        cleaned = img.convert("RGBA") if has_alpha else remove_white_background(img.convert("RGB"))
        out = out_dir / f"{agent_id}.png"
        normalise(cleaned).save(out, optimize=True)
        print(f"  {agent_id}: processed {src.name} -> processed/{out.name}")
        done.append(out)
    if done:
        print("review sheet:", contact_sheet(done))


def main():
    if "--process" in sys.argv:
        return process_manual()
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set. Run: setx GEMINI_API_KEY \"your-key\" and restart your terminal.")

    from google import genai

    client = genai.Client(api_key=key)
    ids = sys.argv[1:] or list(AGENTS)
    done = []
    for agent_id in ids:
        if agent_id not in AGENTS:
            print(f"  unknown agent '{agent_id}', skipping")
            continue
        try:
            done.append(generate(client, agent_id))
        except Exception as e:
            print(f"  {agent_id}: FAILED -> {e}")
    if done:
        print("review sheet:", contact_sheet(done))


if __name__ == "__main__":
    main()
