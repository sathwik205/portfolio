/* CONTENT STUDIO — PROFILE, ACHIEVEMENTS, EDUCATION AND SKILLS
 * Uses the same `content` draft as editor.js. Nothing is sent to a server.
 * Add a field to a schema below to make another data.js field editable.
 */
let activePanel = "projects";
let selectedEntry = 0;

// [data path, label, input kind]. "lines" converts one item per line to an array.
const profileFields = [
  ["profile.name", "Full name"],
  ["profile.shortName", "First / display name"],
  ["profile.surname", "Surname"],
  ["profile.initials", "Portrait signature initials"],
  ["profile.email", "Email", "email"],
  ["profile.phone", "Phone"],
  ["profile.location", "Location"],
  ["profile.resume", "Résumé URL or assets/resume.pdf"],
  ["profile.links.github", "GitHub profile", "url"],
  ["profile.links.linkedin", "LinkedIn profile", "url"],
  ["profile.portraitWebp", "Portrait WebP path (optional)"],
  ["profile.portraitPng", "Portrait PNG / JPG path"],
  ["page.heroStatus", "Role above the opening headline"],
  ["page.headlineStart", "Headline line 1"],
  ["page.headlineMain", "Headline line 2 (without final dot)"],
  ["page.headlineAccent", "Headline italic line"],
  ["page.heroDescription", "Opening description", "textarea"],
  ["page.identityTagline", "Short line beneath your name"],
  ["page.biography", "About-you biography", "textarea"],
  ["page.introBiography", "60-second introduction", "textarea"],
  ["page.dsaCount", "DSA count (updates both visible statistics)"],
  ["page.coreFocus", "Core focus in the introduction"],
  ["page.quote", "Personal quote (without quotation marks)", "textarea"],
  ["page.services", "Services — one per line", "lines"],
];

const entryFields = {
  achievements: [
    ["badge", "Large badge — e.g. 1st, 250+, 2026"],
    ["title", "Achievement title"],
    ["date", "Date or year"],
    ["desc", "What you achieved", "textarea"],
    ["link", "Proof / profile link (optional)", "url"],
  ],
  certifications: [
    ["title", "Certificate title"],
    ["date", "Date or year"],
    ["desc", "Issuer and certificate details", "textarea"],
    ["link", "Credential URL (optional)", "url"],
  ],
  education: [
    ["institution", "Institution"],
    ["degree", "Degree / qualification"],
    ["specialization", "Specialization (optional)"],
    ["duration", "Dates"],
  ],
};

function getField(path) {
  return path.split(".").reduce((value, key) => value?.[key], content);
}

function setField(path, value) {
  const keys = path.split(".");
  const finalKey = keys.pop();
  let target = content;
  keys.forEach((key) => {
    target = target[key];
  });
  target[finalKey] = value;
}

function fieldMarkup(path, label, kind = "text") {
  const rawValue = getField(path);
  const value = kind === "lines" ? (rawValue || []).join("\n") : (rawValue ?? "");
  const multiline = ["textarea", "lines"].includes(kind);
  const attributes = `data-field="${escapeHTML(path)}" data-kind="${kind}"`;
  return /* HTML */ `<label class="${multiline ? "wide" : ""}"
    >${escapeHTML(label)}
    ${multiline
      ? /* HTML */ `<textarea ${attributes} rows="4">${escapeHTML(value)}</textarea>`
      : /* HTML */ `<input
          ${attributes}
          type="${kind}"
          value="${escapeHTML(value)}"
        />`}
  </label>`;
}

function renderContentPanel() {
  const panel = qs("#content-panel");
  const projects = activePanel === "projects";
  panel.hidden = projects;
  qs("#projects-panel").hidden = !projects;
  qs("#new-project").hidden = !projects;
  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.panel === activePanel));
  });
  if (projects) return;

  if (activePanel === "profile") {
    panel.innerHTML = /* HTML */ `<h2>Your profile & story</h2>
      <p class="studio-tip">
        The same fields update every matching placement on the page. Image paths
        reference files you upload separately in assets/.
      </p>
      <form class="form-grid">
        ${profileFields.map((field) => fieldMarkup(...field)).join("")}
      </form>`;
    return;
  }

  if (activePanel === "skills") {
    panel.innerHTML = /* HTML */ `<h2>Inside your toolkit</h2>
      <p class="studio-tip">
        Edit group titles, descriptions and skills. Use one skill per line.
      </p>
      ${content.skillGroups
        .map(
          (group, index) =>
            /* HTML */ `<section class="studio-skill-section">
              <h3>${escapeHTML(group.title)}</h3>
              <form class="form-grid">
                ${fieldMarkup(`skillGroups.${index}.title`, "Group title")}
                ${fieldMarkup(`skillGroups.${index}.symbol`, "Visual symbol")}
                ${fieldMarkup(
                  `skillGroups.${index}.description`,
                  "Group explanation",
                  "textarea",
                )}
                ${fieldMarkup(`skills.${group.key}`, "Skills — one per line", "lines")}
              </form>
            </section>`,
        )
        .join("")}`;
    return;
  }

  const entries = content[activePanel];
  selectedEntry = Math.max(0, Math.min(selectedEntry, entries.length - 1));
  const entry = entries[selectedEntry];
  panel.innerHTML = /* HTML */ `<div class="form-top">
      <h2>${activePanel[0].toUpperCase() + activePanel.slice(1)}</h2>
      <button class="button primary" type="button" data-entry-action="add">
        ＋ Add entry
      </button>
    </div>
    <div class="entry-picker">
      ${entries
        .map(
          (item, index) =>
            /* HTML */ `<button
              type="button"
              data-entry="${index}"
              aria-pressed="${index === selectedEntry}"
            >
              ${String(index + 1).padStart(2, "0")} ·
              ${escapeHTML(item.title || item.institution || "Untitled")}
            </button>`,
        )
        .join("")}
    </div>
    ${entry
      ? /* HTML */ `<div class="entry-actions">
            <button
              type="button"
              data-entry-action="up"
              ${selectedEntry === 0 ? "disabled" : ""}
            >
              ↑ Move up
            </button>
            <button
              type="button"
              data-entry-action="down"
              ${selectedEntry === entries.length - 1 ? "disabled" : ""}
            >
              ↓ Move down
            </button>
            <button type="button" data-entry-action="delete">Delete entry</button>
          </div>
          <form class="form-grid">
            ${entryFields[activePanel]
              .map(([key, label, kind]) =>
                fieldMarkup(`${activePanel}.${selectedEntry}.${key}`, label, kind),
              )
              .join("")}
          </form>`
      : '<p class="empty">Choose Add entry to create your first item.</p>'}`;
}

document.querySelectorAll("[data-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    activePanel = button.dataset.panel;
    selectedEntry = 0;
    renderContentPanel();
  });
});

qs("#content-panel").addEventListener("input", (event) => {
  const input = event.target.closest("[data-field]");
  if (!input) return;
  const value =
    input.dataset.kind === "lines"
      ? input.value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : input.value;
  setField(input.dataset.field, value);
  dirty = true;
  // Update collection labels without rebuilding the focused input.
  if (/\.(title|institution)$/.test(input.dataset.field)) {
    const button = qs(`[data-entry="${selectedEntry}"]`);
    if (button)
      button.textContent = `${String(selectedEntry + 1).padStart(2, "0")} · ${input.value || "Untitled"}`;
  }
});

qs("#content-panel").addEventListener("submit", (event) => event.preventDefault());
qs("#content-panel").addEventListener("click", (event) => {
  const select = event.target.closest("[data-entry]");
  if (select) {
    selectedEntry = Number(select.dataset.entry);
    renderContentPanel();
    return;
  }
  const action = event.target.closest("[data-entry-action]")?.dataset.entryAction;
  if (!action) return;
  const entries = content[activePanel];
  if (action === "add") {
    entries.push(
      Object.fromEntries(entryFields[activePanel].map(([key]) => [key, ""])),
    );
    selectedEntry = entries.length - 1;
  } else if (action === "delete") {
    if (
      !window.confirm(
        "Remove this entry from your draft? This does not change the live site.",
      )
    )
      return;
    entries.splice(selectedEntry, 1);
  } else {
    const next = selectedEntry + (action === "up" ? -1 : 1);
    if (next < 0 || next >= entries.length) return;
    [entries[next], entries[selectedEntry]] = [entries[selectedEntry], entries[next]];
    selectedEntry = next;
  }
  dirty = true;
  renderContentPanel();
});

renderContentPanel();
