# Sathwik Sai Veerapuneni — AI/ML Portfolio

A futuristic Anti-Gravity themed portfolio website.  
**Live demo (after deploy):** `https://<your-vercel-slug>.vercel.app`

---

## 🚀 Quick Start (Local)

No build step required — pure HTML/CSS/JS.

1. Open the `cv/` folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

> **Why Live Server?** The site fetches `data.json` via `fetch()`. Opening `index.html` directly as a file (`file://...`) blocks that request. Live Server fixes this.

---

## ✏️ How to Update Content

**All editable content lives in one file: [`data.json`](data.json)**

| What you want to change | Where in `data.json` |
|---|---|
| Name, email, phone, location | `profile` object |
| GitHub / LinkedIn URLs | `profile.links` |
| Resume download link | `profile.resume` |
| Hero typed roles | `profile.typedRoles` (array of strings) |
| Education entries | `education` array |
| Skills | `skills` object (`languages`, `aiml`, `core`, `tools`) |
| Projects | `projects` array |
| Project hover metrics | each project's `metrics` object |
| Achievements / Certifications | `achievements` array |

### Example — Change a Typed Role
```json
"typedRoles": ["AI/ML Engineer", "Your New Role", "Problem Solver"]
```

### Example — Add a Project
```json
{
  "title": "My New Project",
  "icon": "fas fa-robot",
  "tag": "Deep Learning | NLP",
  "description": "What the project does...",
  "tech": ["Python", "PyTorch", "Hugging Face"],
  "highlight": "Achieved 95% accuracy.",
  "metrics": { "accuracy": "95%", "precision": "92%", "recall": "90%" },
  "color": "purple"
}
```
> `color` options: `"purple"`, `"blue"`, `"cyan"`

---

## 🖼️ Adding Your Profile Photo

Place a square image named **`profile.jpg`** inside the `cv/` folder.  
The holographic card will automatically display it.

---

## 📁 File Structure

```
cv/
├── index.html      ← Page structure (rarely needs editing)
├── style.css       ← All visual styles
├── script.js       ← Animations, typed text, data rendering
├── data.json       ← ✅ YOUR CONTENT — edit this!
├── profile.jpg     ← Your photo (add this yourself)
├── vercel.json     ← Vercel deployment config
└── README.md       ← This file
```

---

## ☁️ Deploy to Vercel via GitHub

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial portfolio commit"
git remote add origin https://github.com/sathwik205/<repo-name>.git
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework Preset: **Other** (Static Site)
4. Root Directory: leave as `/` (or `cv/` if you pushed only that folder)
5. Click **Deploy** ✅

### Step 3 — Re-deploy on Content Changes
Just edit `data.json`, commit, and push:
```bash
git add data.json
git commit -m "Update projects"
git push
```
Vercel auto-deploys on every push. 🎉

---

## 🎨 Theming Quick Reference

Open `style.css` and change variables at the top:

```css
:root {
    --bg:          #050505;   /* Background */
    --neon-cyan:   #00f2ff;   /* Primary accent */
    --neon-purple: #bc13fe;   /* CTA / buttons */
    --electric:    #0055ff;   /* Secondary accent */
    --lpu-orange:  #ff8c00;   /* Education / tools */
}
```
