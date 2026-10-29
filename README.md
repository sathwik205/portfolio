# Sathwik's portfolio — editable edition

The same charcoal/red and ivory portfolio, with readable source and a complete
browser-based content editor. No framework, package installation or build step
is needed to open the site.

1. Extract the ZIP completely.
2. Open this folder in VS Code using **File → Open Folder**.
3. Open `index.html` in a browser to view the site.
4. Open `editor.html` to edit content using forms.
5. Read **EDITING-GUIDE.txt** for full instructions and publishing steps.

## Where to edit

| File | Responsibility |
| --- | --- |
| `data.js` | Your projects, profile, biography, awards, certificates, education and skills |
| `index.html` | Page structure, section headings and navigation |
| `style.css` | Colors, layout, responsive styles and CSS animations |
| `content.js` | Connects the editable personal copy to the page |
| `script.js` | Project cards, search, filtering, saved work and dialogs |
| `motion.js` | Scroll reveals, motion preferences, portrait tilt and pointer effects |
| `editor.html` / `editor.css` | Portfolio Studio layout |
| `editor.js` | Project forms, validation, export and local drafts |
| `editor-content.js` | Profile, achievements, certificates, education and skills forms |
| `assets/` | All portrait, sculpture, cover and icon files |

## First upgrade from your earlier version

Upload the **contents of this folder** beside the existing GitHub `index.html`.
Include the three new files: `content.js`, `motion.js`, `editor-content.js`.
Keep all eight bundled image files inside `assets/`. Do not upload just the ZIP
or nest another portfolio folder inside your repository.

After this one-time upgrade, normal content updates only require the exported
`data.js` and any new images. GitHub source changes are deployed by the connected
Vercel project. This ZIP has not itself been deployed to your live website.

## Formatting

Source files are expanded with indentation and section comments. Included VS Code
settings turn on word wrapping, two-space indentation and formatting on save.
`data.js` intentionally uses JSON-compatible quoted keys, without trailing commas,
so Studio can import it safely without executing uploaded JavaScript. If your
formatter changes that, use Studio's export to regenerate a compatible data file.

## Validation

JavaScript syntax, asset paths and DOM-level interaction/content editing flows were
checked. Browser visual QA was unavailable in the build environment; no measured
FPS or cross-browser rendering result is claimed. Check your local desktop and
phone before replacing your production files.

With Node installed, run `node tools/check.mjs` for a dependency-free source and
asset check. No Node installation is needed to view or edit the website itself.
