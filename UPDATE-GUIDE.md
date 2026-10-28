# Update your portfolio — portable edition

Start with **START-HERE.html** for the illustrated setup and deployment guide. All assets are included locally. This is a static site: upload the folder containing index.html; no build or install command.

## Easiest: use Project Studio

1. Open `editor.html` from this folder. On the hosted site, visit `/editor.html`.
2. Select an existing project, or choose **Add project**.
3. Fill in the title, description, category, technologies, and repository/demo links. Choose a generated artwork style or add your own cover image.
4. Use the ↑ / ↓ buttons to reorder the collection. **Save local draft** stores work only in that browser. Export unfinished work after completing the required fields; local drafts can contain unfinished fields.
5. Choose **Download data.js**. Replace the existing `data.js` in your portfolio folder with the download. Do not rename it to data (1).js.
6. Open `index.html` to check the result. Upload/redeploy the updated folder with your usual static host. If you use Git-based hosting, commit and push the changed `data.js` and any image assets to your connected repository.

To update the ChatGPT-hosted version, attach the exported `data.js` to this conversation and ask: **“Update my existing portfolio with these projects and publish it.”** I can apply and publish the change to the same site.

Project Studio is a browser-only content editor, not an authenticated CMS. It does not write to the deployed website or a remote database. Each visitor's saved draft is local to their browser. Download your changes before clearing browser storage. The editor's Import button imports projects from a data.js or JSON file without executing JavaScript. Import replaces the local project collection and keeps your other profile details.

## Cover images

Use a landscape image, ideally around 1200 × 800 pixels, and compress to WebP or JPEG (aim for under 200 KB).

- Put it in `assets/my-project.webp` beside `index.html`, and enter that exact relative path in the editor.
- Or use a stable HTTPS image URL that allows external loading.
- The image is not included in a data.js download. Include the assets folder in your deployment.
- Leave the image field empty to use the built-in vector artwork.

## Manual editing

`data.js` is the single content source. It starts with `window.PORTFOLIO =` followed by the data object. No JSON copy needs to be synchronized.

Duplicate a project object inside `projects`, or use Project Studio to avoid syntax mistakes. For example:

```javascript
{
  "id": "my-new-project",
  "title": "My New Project",
  "posterTitle": "A NEW\nPERSPECTIVE.",
  "category": "ml",
  "artwork": "clusters",
  "description": "What I built and the problem it solves.",
  "problem": "The challenge or user need.",
  "approach": "My implementation and technical decisions.",
  "tag": "Computer Vision | Classification",
  "tech": ["Python", "TensorFlow"],
  "highlight": "A verified result or important feature.",
  "github": "https://github.com/your-username/your-project",
  "live": "",
  "image": "",
  "metrics": {"accuracy": "92%"}
}
```

- Keep every `id` unique and stable, even when reordering projects. This keeps visitors' My List selections connected to the right project.
- Category values: `ml`, `ai`, or `other`. Other projects appear under All projects.
- Artwork values: `clusters`, `pulse`, or `city`.
- `posterTitle` can use `\n` to split the headline onto multiple lines. Keep it short.
- `problem`, `approach`, `metrics`, `highlight`, `live`, and `image` are optional. Only publish metrics you can substantiate. The original health project's ambiguously labeled metrics remain hidden via `hideMetrics`; editing its metrics in Studio removes that flag.
- Omit an unavailable demo/repository link instead of using a placeholder.

The same data file also contains profile links, education, skills, achievements, and certifications. Those structured lists are rendered automatically. The opening headline, biography, and 60-second introduction are in `index.html`; styling is in `style.css`; interactions are in `script.js`. The skill-group explanations in `script.js` should be updated if you change the skill groups substantially.

## Motion and accessibility

Scrolling is native. The site uses short opacity/transform entrances, scroll-linked hero depth, and a reading progress bar. Offscreen decorative animations pause. Visitors can disable decorative motion using the bottom-right motion control; the setting is saved locally. System reduced-motion preferences are respected automatically. Dialogs support Escape and keyboard focus through native dialog behavior.

## Run and publish

No installation or build command is required. `index.html` works directly from this folder. Serve or deploy the entire folder as a static website; keep these files together:

- index.html, style.css, script.js, data.js
- editor.html, editor.css, editor.js (optional if you do not want to host the editor)
- assets/ (if you add images)

The ChatGPT-hosted site remains private unless you change its audience. Downloading this source does not change hosting permissions.

## Publishing / compatibility

Use a static HTML preset, no build command, and publish the directory containing index.html. All links to local resources are relative, so a subdirectory deployment is supported. START-HERE.html has a settings table. Keep the assets folder intact, including the PNG fallback. The visual covers are illustrative project concepts, not actual application screenshots.

The entry sequence lasts about 1.3 seconds, runs once per session, and never captures pointer input. It disappears for reduced-motion users. The featured-project carousel is manually controlled. The 60-second intro is a concise text overview with links to the work and résumé, not a video.

The project editor is not a password-protected admin console and has no publishing credentials. Each visitor can only change their own browser draft. You can omit editor.html, editor.css, editor.js and the guides from a public upload while keeping local copies for future edits.

## Your portrait and hover effects

Your supplied portrait is bundled as assets/sathwik.png, with a lossless assets/sathwik.webp copy. The page uses WebP when supported and the PNG as fallback. To change your portrait later, replace both files with matching versions of your new picture, or update all portrait picture/source paths in index.html. The original portrait has not been retouched.

Portrait tilt, the following Explore label, and magnetic button movement work only with a fine pointer. They reset on scroll, keyboard focus, window blur, and when motion is disabled. They do not replace the normal cursor or intercept scrolling. The motion control and system reduced-motion preference disable them. Styles are grouped under “Personal portrait” in style.css; pointer behavior is at the end of script.js.
