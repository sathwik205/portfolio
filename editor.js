// PROJECT STUDIO LOGIC
// Profile and milestone forms: editor-content.js.
// Drafts are local to this browser. Download data.js to publish changes.
"use strict";
const qs = (s) => document.querySelector(s);
const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const clone = (o) => JSON.parse(JSON.stringify(o));
let content = clone(window.PORTFOLIO),
  selected = 0,
  dirty = false,
  draftNotice = "";
const key = "sathwik-portfolio-studio-v3";
// Drafts now contain the whole portfolio, not only projects.

function validateProjects(projects) {
  if (!Array.isArray(projects) || projects.length > 200)
    throw new Error(
      "Please use a portfolio file with a projects array (up to 200 projects).",
    );
  const ids = new Set();
  projects.forEach((p, i) => {
    if (
      !p ||
      typeof p !== "object" ||
      Array.isArray(p) ||
      typeof p.title !== "string" ||
      !p.title.trim() ||
      typeof p.description !== "string" ||
      !p.description.trim() ||
      !Array.isArray(p.tech) ||
      !p.tech.length ||
      p.tech.some((t) => typeof t !== "string")
    )
      throw new Error(`Project ${i + 1} needs a title, description and technologies.`);
    if (p.id && (typeof p.id !== "string" || ids.has(p.id)))
      throw new Error("Each project must have a unique text ID.");
    if (p.id) ids.add(p.id);
    for (const field of [
      "problem",
      "approach",
      "posterTitle",
      "tag",
      "github",
      "live",
      "image",
      "highlight",
      "artwork",
      "category",
    ])
      if (p[field] != null && typeof p[field] !== "string")
        throw new Error(`Project ${i + 1}: ${field} must be text.`);
    for (const field of ["github", "live"])
      if (p[field]) {
        let u;
        try {
          u = new URL(p[field]);
        } catch {
          throw new Error(`Project ${i + 1}: use a complete URL for ${field}.`);
        }
        if (!["https:", "http:"].includes(u.protocol))
          throw new Error(`Project ${i + 1}: ${field} must use https:// or http://.`);
      }
    if (p.image && !validImage(p.image))
      throw new Error(
        `Project ${i + 1}: use an HTTPS image or an assets/filename.webp path.`,
      );
    if (
      p.metrics != null &&
      (typeof p.metrics !== "object" ||
        Array.isArray(p.metrics) ||
        Object.values(p.metrics).some((v) => !["string", "number"].includes(typeof v)))
    )
      throw new Error(`Project ${i + 1}: metrics must contain labels and values.`);
  });
  return projects;
}
function validImage(url) {
  if (/^(assets\/|images\/)[a-z0-9_./-]+$/i.test(url) && !url.includes(".."))
    return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
// Check the complete export before it can replace a working data.js.
function validateContent(value, draft = false) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Choose a complete portfolio data.js file.");
  }
  if (!Array.isArray(value.projects)) throw new Error("Projects must be a list.");
  validateProjects(
    draft
      ? value.projects.map((p) => ({
          ...p,
          title: p.title || "Draft",
          description: p.description || "Draft",
          tech: p.tech?.length ? p.tech : ["Draft"],
        }))
      : value.projects,
  );
  if (!value.profile || !value.page || !value.profile.links)
    throw new Error("Profile and page content are required.");
  for (const key of [
    "name",
    "shortName",
    "surname",
    "initials",
    "email",
    "phone",
    "location",
    "resume",
    "portraitPng",
  ]) {
    if (
      typeof value.profile[key] !== "string" ||
      (!draft && !value.profile[key].trim())
    ) {
      throw new Error(`Profile: fill in ${key} in Profile & story.`);
    }
  }
  for (const [key, text] of Object.entries(value.page)) {
    if (key !== "services" && typeof text !== "string")
      throw new Error(`Page ${key} must be text.`);
  }
  if (
    !Array.isArray(value.page.services) ||
    value.page.services.some((s) => typeof s !== "string")
  )
    throw new Error("Services must be a list of text items.");
  for (const key of ["achievements", "certifications", "education"]) {
    if (!Array.isArray(value[key]) || value[key].length > 200)
      throw new Error(`${key} must be a list with at most 200 entries.`);
    value[key].forEach((entry, index) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        throw new Error(`Invalid ${key} entry ${index + 1}.`);
      const required =
        key === "education"
          ? ["institution", "degree", "duration"]
          : ["title", "date", "desc"];
      for (const field of required) {
        if (typeof entry[field] !== "string" || (!draft && !entry[field].trim()))
          throw new Error(`${key} entry ${index + 1} needs ${field}.`);
      }
      for (const field of ["badge", "link", "specialization"]) {
        if (entry[field] != null && typeof entry[field] !== "string")
          throw new Error(`${key}: ${field} must be text.`);
      }
      if (!draft && entry.link)
        validateWebUrl(entry.link, `${key} entry ${index + 1} link`);
    });
  }
  if (
    !Array.isArray(value.skillGroups) ||
    !value.skillGroups.length ||
    !value.skills ||
    typeof value.skills !== "object"
  )
    throw new Error("Keep at least one skill group.");
  const keys = new Set();
  value.skillGroups.forEach((group) => {
    if (
      !group ||
      ["key", "title", "symbol", "description"].some(
        (key) => typeof group[key] !== "string",
      ) ||
      !/^[a-z][a-z0-9_-]*$/i.test(group.key) ||
      keys.has(group.key)
    )
      throw new Error(
        "Skill groups need unique keys, titles, symbols and descriptions.",
      );
    keys.add(group.key);
    if (
      !Array.isArray(value.skills[group.key]) ||
      value.skills[group.key].some((item) => typeof item !== "string")
    )
      throw new Error(`Skills for ${group.title} must be a list of text items.`);
  });
  if (!draft) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.profile.email))
      throw new Error("Enter a valid email address.");
    for (const key of ["github", "linkedin"])
      validateWebUrl(value.profile.links[key], `Profile ${key}`);
    if (
      !/^assets\/[a-z0-9_.\/-]+\.pdf$/i.test(value.profile.resume) ||
      value.profile.resume.includes("..")
    )
      validateWebUrl(value.profile.resume, "Résumé");
    for (const key of ["portraitWebp", "portraitPng"])
      if (value.profile[key] && !validImage(value.profile[key]))
        throw new Error(`${key}: use an assets/ path or direct HTTPS image URL.`);
  }
  return value;
}

function validateWebUrl(value, label) {
  try {
    if (!["https:", "http:"].includes(new URL(value).protocol)) throw new Error();
  } catch {
    throw new Error(
      `${label}: use a complete https:// URL, or clear an optional link.`,
    );
  }
}

// Restore the complete local draft. Fall back to the bundled file on errors.
try {
  const stored = localStorage.getItem(key);
  if (stored) {
    const parsed = JSON.parse(stored);
    validateContent(parsed, true);
    content = parsed;
    draftNotice =
      "Your saved portfolio draft has been restored. The live site is unchanged.";
  }
} catch {
  draftNotice = "Could not restore the saved draft. Loaded the bundled portfolio.";
}
function status(message) {
  qs("#editor-status").textContent = message;
}
function list() {
  qs("#project-total").textContent = content.projects.length;
  qs("#project-list").innerHTML = content.projects
    .map(
      (p, i) =>
        /* HTML */ `<div class="studio-project ${i === selected ? "selected" : ""}">
          <button class="studio-select" data-select="${i}">
            <small>PROJECT ${String(i + 1).padStart(2, "0")}</small>${escapeHTML(
              p.title || "Untitled project",
            )}
          </button>
          <div class="reorder">
            <button
              data-move="${i}"
              data-direction="-1"
              aria-label="Move ${escapeHTML(p.title)} up"
              ${i === 0 ? "disabled" : ""}
            >
              ↑</button
            ><button
              data-move="${i}"
              data-direction="1"
              aria-label="Move ${escapeHTML(p.title)} down"
              ${i === content.projects.length - 1 ? "disabled" : ""}
            >
              ↓
            </button>
          </div>
        </div>`,
    )
    .join("");
}
function preview() {
  const p = content.projects[selected];
  if (!p) return;
  qs("#card-preview").innerHTML = /* HTML */ `<div
    class="preview-poster ${["pulse", "city"].includes(p.artwork) ? p.artwork : ""}"
  >
    ${p.image && validImage(p.image)
      ? /* HTML */ `<img src="${escapeHTML(p.image)}" alt="" loading="lazy" />`
      : ""}<small>${escapeHTML(p.tag || "YOUR NEXT PROJECT")}</small>
    <h3>${escapeHTML(p.posterTitle || p.title || "Your next idea.")}</h3>
  </div>`;
}
function show() {
  list();
  const p = content.projects[selected];
  qs("#project-form").hidden = !p;
  qs("#editor-empty").hidden = !!p;
  if (!p) return;
  for (const name of [
    "title",
    "problem",
    "approach",
    "category",
    "posterTitle",
    "artwork",
    "description",
    "tag",
    "tech",
    "highlight",
    "github",
    "live",
    "image",
    "metrics",
  ]) {
    let value = p[name] ?? "";
    if (name === "tech") value = (p.tech || []).join(", ");
    if (name === "metrics")
      value = Object.entries(p.metrics || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    if (name === "category") value = p.category || "ml";
    if (name === "artwork") value = p.artwork || "clusters";
    qs("#project-form").elements[name].value = value;
  }
  qs("#form-title").textContent = `Edit project ${selected + 1}`;
  preview();
}
function readForm() {
  const p = content.projects[selected];
  if (!p) return;
  const f = qs("#project-form").elements;
  for (const name of [
    "title",
    "problem",
    "approach",
    "category",
    "posterTitle",
    "artwork",
    "description",
    "tag",
    "highlight",
    "github",
    "live",
    "image",
  ])
    p[name] = f[name].value.trim();
  p.tech = f.tech.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const metrics = {};
  let invalid = false;
  for (const line of f.metrics.value.split("\n").filter((s) => s.trim())) {
    const colon = line.indexOf(":");
    if (colon < 1 || !line.slice(colon + 1).trim()) {
      invalid = true;
      continue;
    }
    metrics[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  f.metrics.setCustomValidity(
    invalid ? "Write each metric as label: value, one per line." : "",
  );
  if (Object.keys(metrics).length) p.metrics = metrics;
  else delete p.metrics;
  dirty = true;
  list();
  preview();
}
qs("#project-form").addEventListener("input", (e) => {
  if (e.target.name === "metrics" && content.projects[selected])
    delete content.projects[selected].hideMetrics;
  readForm();
});
qs("#project-form").addEventListener("change", readForm);
qs("#project-form").addEventListener("submit", (e) => e.preventDefault());
qs("#project-list").addEventListener("click", (e) => {
  const choose = e.target.closest("[data-select]");
  if (choose) {
    selected = Number(choose.dataset.select);
    show();
  }
  const move = e.target.closest("[data-move]");
  if (move) {
    const from = Number(move.dataset.move),
      to = from + Number(move.dataset.direction);
    if (to < 0 || to >= content.projects.length) return;
    const active = content.projects[selected];
    [content.projects[from], content.projects[to]] = [
      content.projects[to],
      content.projects[from],
    ];
    selected = content.projects.indexOf(active);
    dirty = true;
    show();
  }
});
qs("#new-project").addEventListener("click", () => {
  content.projects.push({
    id: "project-" + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36)),
    title: "New project",
    posterTitle: "YOUR NEXT\nBIG IDEA.",
    category: "ml",
    artwork: "clusters",
    description: "",
    tag: "",
    tech: [],
    highlight: "",
    github: "",
    live: "",
    image: "",
  });
  selected = content.projects.length - 1;
  dirty = true;
  show();
  qs("#project-form").elements.title.focus();
});
qs("#save-draft").addEventListener("click", () => {
  try {
    localStorage.setItem(key, JSON.stringify(content));
    dirty = false;
    status(
      "Draft saved on this browser. Download data.js when you are ready to publish.",
    );
  } catch {
    status("Browser storage is unavailable. Download data.js to keep your changes.");
  }
});
qs("#export").addEventListener("click", () => {
  try {
    validateContent(content);
    if (
      !qs("#projects-panel").hidden &&
      !qs("#project-form").hidden &&
      !qs("#project-form").reportValidity()
    )
      return;
    const text =
      "// EDIT CONTENT HERE — or open editor.html for the Portfolio Studio forms.\n// Keep project IDs stable and upload image files separately.\nwindow.PORTFOLIO = " +
      JSON.stringify(content, null, 2) +
      ";\n";
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/javascript;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    dirty = false;
    status(
      "Downloaded data.js. Replace your existing file and redeploy, or send it in this chat to update the hosted site.",
    );
  } catch (error) {
    status(error.message);
  }
});
qs("#import").addEventListener("change", async (e) => {
  const input = e.target;
  const file = input.files[0];
  if (!file) return;
  try {
    if (file.size > 2 * 1024 * 1024)
      throw new Error("Choose a content file smaller than 2 MB.");
    let text = (await file.text())
      .trim()
      .replace(/^\/\/[^\n]*\n/gm, "")
      .trim();
    text = text.replace(/^window\.PORTFOLIO\s*=\s*/, "").replace(/;\s*$/, "");
    const parsed = JSON.parse(text);
    const imported = {
      ...clone(window.PORTFOLIO),
      ...parsed,
      profile: { ...clone(window.PORTFOLIO.profile), ...parsed.profile },
      page: { ...clone(window.PORTFOLIO.page), ...parsed.page },
    };
    validateContent(imported);
    content = clone(imported);
    selected = 0;
    dirty = true;
    show();
    renderContentPanel();
    status(
      "Full portfolio imported: projects, profile, education and recognition. Save or download to keep it.",
    );
  } catch (error) {
    status("Import failed: " + error.message);
  } finally {
    input.value = "";
  }
});
qs("#delete-project").addEventListener("click", () => qs("#delete-dialog").showModal());
qs("#cancel-delete").addEventListener("click", () => qs("#delete-dialog").close());
qs("#confirm-delete").addEventListener("click", () => {
  content.projects.splice(selected, 1);
  selected = Math.max(0, Math.min(selected, content.projects.length - 1));
  dirty = true;
  show();
  qs("#delete-dialog").close();
  status("Project removed from this draft. The live portfolio is unchanged.");
});
qs("#reset").addEventListener("click", () => qs("#reset-dialog").showModal());
qs("#cancel-reset").addEventListener("click", () => qs("#reset-dialog").close());
qs("#confirm-reset").addEventListener("click", () => {
  try {
    localStorage.removeItem(key);
  } catch {}
  content = clone(window.PORTFOLIO);
  selected = 0;
  dirty = false;
  show();
  renderContentPanel();
  qs("#reset-dialog").close();
  status("Draft reset to all content bundled with this page.");
});
window.addEventListener("beforeunload", (e) => {
  if (dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
show();
if (draftNotice) status(draftNotice);

qs("#import-open").addEventListener("click", () => qs("#import").click());
