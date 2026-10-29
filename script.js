// PORTFOLIO INTERACTIONS
// Content: data.js | Personal copy: content.js | Animation: motion.js
// This file handles project cards, filtering, search, dialogs and saved work.
"use strict";
const data = window.PORTFOLIO;
const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const projectId = (i) =>
  data.projects[i].id || data.projects[i].github || data.projects[i].title;
let saved = [];
try {
  const s = JSON.parse(localStorage.getItem("sathwik-my-list") || "[]");
  if (Array.isArray(s))
    saved = [
      ...new Set(
        s
          .map((v) => (Number.isInteger(v) && data.projects[v] ? projectId(v) : v))
          .filter((v) => data.projects.some((_, i) => projectId(i) === v)),
      ),
    ];
} catch {}
let filter = "all";
let toastTimer;
const posterTitle = (p) => esc(p.posterTitle || p.title).replace(/\n/g, "<br>");
const safeLink = (url) => {
  try {
    const u = new URL(url);
    return ["https:", "http:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
};
const safeImage = (url) => {
  if (!url) return "";
  if (/^(assets\/|images\/)[a-z0-9_./-]+$/i.test(url) && !url.includes(".."))
    return url;
  return safeLink(url);
};

function art(index) {
  const p = data.projects[index];
  const artwork = ["clusters", "pulse", "city"].includes(p.artwork)
    ? p.artwork
    : ["clusters", "pulse", "city"][index % 3];
  const cover = safeImage(p.image) || "assets/cover-" + artwork + ".svg";
  return /* HTML */ `<img
    src="${esc(cover)}"
    alt=""
    loading="lazy"
    decoding="async"
  />`;
}
function card(i) {
  const p = data.projects[i];
  return /* HTML */ `<article class="project-card">
    <button class="poster" data-project="${i}" aria-label="Explore ${esc(p.title)}">
      <div class="poster-art">${art(i)}</div>
      <div class="poster-label"><b>S</b> SELECTED WORK</div>
      <div class="poster-copy">
        <small>${esc((p.tag || "").toUpperCase())}</small>
        <h3>${posterTitle(p)}</h3>
      </div>
      <span class="poster-play" aria-hidden="true">▶</span>
    </button>
    <div class="card-info">
      <span class="number">${String(i + 1).padStart(2, "0")}</span>
      <div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.tech.slice(0, 3).join(" · "))}</p>
      </div>
      <button
        class="save-button"
        data-save="${i}"
        aria-pressed="${saved.includes(projectId(i))}"
        aria-label="${saved.includes(projectId(i)) ? "Remove" : "Save"} ${esc(p.title)}"
      >
        ${saved.includes(projectId(i)) ? "✓" : "+"}
      </button>
    </div>
  </article>`;
}
function render() {
  const ids = data.projects
    .map((_, i) => i)
    .filter((i) => filter === "all" || filter === (data.projects[i].category || "ml"));
  $("#project-grid").innerHTML = ids.map(card).join("");
  document
    .querySelectorAll("#project-grid .project-card")
    .forEach((card, index) =>
      card.style.setProperty("--card-delay", `${Math.min(index, 5) * 35}ms`),
    );
  $("#project-empty").hidden = !!ids.length;
  $("#saved-grid").innerHTML = saved
    .map((id) => data.projects.findIndex((_, i) => projectId(i) === id))
    .filter((i) => i >= 0)
    .map(card)
    .join("");
  $("#saved-empty").hidden = !!saved.length;
  $("#list-count").textContent = saved.length;
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2300);
}
function toggleSave(i) {
  saved = saved.includes(projectId(i))
    ? saved.filter((x) => x !== projectId(i))
    : [...saved, projectId(i)];
  try {
    localStorage.setItem("sathwik-my-list", JSON.stringify(saved));
  } catch {
    toast("Saved for this visit. Browser storage is unavailable.");
    render();
    return;
  }
  render();
  toast(saved.includes(projectId(i)) ? "Added to My List" : "Removed from My List");
}
function openProject(i) {
  const p = data.projects[i];
  const metrics =
    !p.metrics || p.hideMetrics
      ? /* HTML */ `<p class="highlight">
          ${esc(
            p.highlight ||
              "Explore the implementation and architecture in the repository.",
          )}
        </p>`
      : /* HTML */ `${p.highlight
            ? /* HTML */ `<p class="highlight">
                ${esc(
                  p.highlight ||
                    "Explore the implementation and architecture in the repository.",
                )}
              </p>`
            : ""}
          <div class="metric-row">
            ${Object.entries(p.metrics || {})
              .map(
                ([k, v]) =>
                  /* HTML */ `<div>
                    <strong>${esc(v)}</strong><small>${esc(k.toUpperCase())}</small>
                  </div>`,
              )
              .join("")}
          </div>
          <p class="metric-note">Project-reported evaluation metrics.</p>`;
  $("#detail").innerHTML = /* HTML */ `<div class="detail-art">
      <div class="poster-art">${art(i)}</div>
    </div>
    <div class="detail-body">
      <div class="detail-meta"
        >PROJECT ${String(i + 1).padStart(2, "0")} &nbsp; / &nbsp; ${esc(p.tag)}</div
      >
      <h2 id="detail-title">${esc(p.title)}</h2>
      <p>${esc(p.description)}</p>
      ${p.problem || p.approach
        ? /* HTML */ `<div class="case-study">
            ${p.problem
              ? /* HTML */ `<section>
                  <h3>THE PROBLEM</h3>
                  <p>${esc(p.problem)}</p>
                </section>`
              : ""}${p.approach
              ? /* HTML */ `<section>
                  <h3>THE APPROACH</h3>
                  <p>${esc(p.approach)}</p>
                </section>`
              : ""}
          </div>`
        : ""}${metrics}
      <div class="chips">
        ${p.tech.map((t) => /* HTML */ `<span>${esc(t)}</span>`).join("")}
      </div>
      ${safeLink(p.github)
        ? /* HTML */ `<a
            class="button primary"
            href="${esc(safeLink(p.github))}"
            target="_blank"
            rel="noopener"
            >Explore the code ↗</a
          >`
        : ""}
      ${safeLink(p.live)
        ? /* HTML */ `<a
            class="button secondary"
            href="${esc(safeLink(p.live))}"
            target="_blank"
            rel="noopener"
            >Live project ↗</a
          >`
        : ""}
    </div>`;
  openDialog($("#project-dialog"));
}
// ---- PROJECT ACTIONS: open details, save, filter ----
document.addEventListener("click", (e) => {
  const project = e.target.closest("[data-project]");
  if (project) openProject(Number(project.dataset.project));
  const save = e.target.closest("[data-save]");
  if (save) {
    const container = save.closest("#saved-grid") ? "#saved-grid" : "#project-grid";
    toggleSave(Number(save.dataset.save));
    const replacement = document.querySelector(
      `${container} [data-save="${save.dataset.save}"]`,
    );
    if (replacement) replacement.focus({ preventScroll: true });
    else $("#close-list").focus({ preventScroll: true });
  }
});
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    $("#project-grid").classList.add("is-filtering");
    document.querySelectorAll("[data-filter]").forEach((x) => {
      x.classList.toggle("selected", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    render();
  }),
);
document.querySelectorAll("dialog").forEach((d) => {
  d.querySelector(".dialog-close").addEventListener("click", () => closeDialog(d));
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        closeDialog(d);
    }
  });
});
$("#list-nav").addEventListener("click", () => {
  $("#saved").hidden = false;
  $("#saved").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
});
$("#close-list").addEventListener("click", () => {
  $("#saved").hidden = true;
  $("#list-nav").focus();
});
// ---- EDUCATION, SKILLS AND RECOGNITION ----
$("#education").innerHTML = data.education
  .map(
    (e, i) =>
      /* HTML */ `<article class="episode">
        <span>${String(i + 1).padStart(2, "0")}</span>
        <div>
          <small>${esc(e.duration)}</small>
          <h4>${esc(e.institution)}</h4>
          <p>
            ${esc(e.degree)}${e.specialization ? " · " + esc(e.specialization) : ""}
          </p>
        </div>
      </article>`,
  )
  .join("");
// Skills are described beside their editable lists in data.js.
const skillGroups = data.skillGroups;
const groups = skillGroups.map((group) => group.title);
const symbols = skillGroups.map((group) => group.symbol);
const skillDescriptions = skillGroups.map((group) => group.description);
$("#skills").innerHTML = skillGroups
  .map(
    (group, i) =>
      /* HTML */ `<button
        class="skill-group"
        data-skill="${i}"
        aria-pressed="${i === 0}"
        aria-controls="stack-detail"
      >
        <span class="skill-visual skill-visual-${i % 4}"
          ><span>${esc(symbols[i])}</span><i></i><i></i><i></i
        ></span>
        <h3
          ><span>${String(i + 1).padStart(2, "0")}</span>${esc(groups[i])} <b>↗</b></h3
        >
        <div class="chips">
          ${(data.skills[group.key] || [])
            .map((s) => /* HTML */ `<span>${esc(s)}</span>`)
            .join("")}
        </div>
      </button>`,
  )
  .join("");
function selectSkill(i) {
  $("#stack-detail").innerHTML = /* HTML */ `<span class="stack-detail-label"
      >INSIDE THE TOOLKIT / ${String(i + 1).padStart(2, "0")}</span
    >
    <h3>${esc(groups[i])}</h3>
    <p>${esc(skillDescriptions[i])}</p>`;
  document
    .querySelectorAll("[data-skill]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(Number(b.dataset.skill) === i)),
    );
}
document
  .querySelectorAll("[data-skill]")
  .forEach((b) =>
    b.addEventListener("click", () => selectSkill(Number(b.dataset.skill))),
  );
selectSkill(0);
$("#achievements").innerHTML = data.achievements
  .map(
    (a, i) =>
      /* HTML */ `<article class="achievement">
        <strong>${esc(a.badge || String(i + 1).padStart(2, "0"))}</strong>
        <div>
          <small>${esc(a.date)}</small>
          <h3>
            ${esc(a.title)}${safeLink(a.link)
              ? /* HTML */ ` <a
                  href="${esc(safeLink(a.link))}"
                  target="_blank"
                  rel="noopener"
                  aria-label="View ${esc(a.title)}"
                  >↗</a
                >`
              : ""}
          </h3>
          <p>${esc(a.desc)}</p>
        </div>
      </article>`,
  )
  .join("");
$("#certifications").innerHTML = data.certifications
  .map((c) => {
    const valid = safeLink(c.link) && !c.link.includes("YOUR_");
    return /* HTML */ `<${valid ? "a" : "article"} class="certificate" ${valid ? `href="${esc(c.link)}" target="_blank" rel="noopener"` : ""}><h4>${esc(c.title)}</h4><p>${esc(c.desc)}</p><small>${esc(c.date)} · ${valid ? "View credential ↗" : "Certificate link coming soon"}</small></${valid ? "a" : "article"}>`;
  })
  .join("");
$("#resume").href = data.profile.resume;
$("#email").href = "mailto:" + data.profile.email;
$("#socials").innerHTML = /* HTML */ `<a
    href="${esc(data.profile.links.github)}"
    target="_blank"
    rel="noopener"
    >GitHub ↗</a
  ><a href="${esc(data.profile.links.linkedin)}" target="_blank" rel="noopener"
    >LinkedIn ↗</a
  ><a href="tel:${esc(data.profile.phone.replace(/[^+\d]/g, ""))}"
    >${esc(data.profile.phone)}</a
  ><span>${esc(data.profile.location)}</span>`;
$("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(data.profile.email);
    toast("Email copied to clipboard");
  } catch {
    toast(data.profile.email);
  }
});
// ---- SEARCH ----
const sections = [
  ["My story & education", "story", "education university background"],
  ["Skills & services", "expertise", Object.values(data.skills).flat().join(" ")],
  [
    "Contact " + data.profile.shortName,
    "contact",
    "email phone linkedin github resume",
  ],
  ["Achievements & certifications", "recognition", "oracle hackathon leetcode DSA"],
];
function search() {
  const q = $("#search-input").value.trim().toLowerCase();
  const projects = data.projects
    .map((p, i) => ({ p, i }))
    .filter(
      ({ p }) =>
        !q || [p.title, p.description, ...p.tech].join(" ").toLowerCase().includes(q),
    );
  const matching = sections.filter(
    ([name, id, tags]) => !q || (name + " " + tags).toLowerCase().includes(q),
  );
  $("#search-results").innerHTML =
    projects
      .map(
        ({ p, i }) =>
          /* HTML */ `<button class="search-result" data-search-project="${i}">
            ${esc(p.title)}<span>PROJECT ↗</span>
          </button>`,
      )
      .join("") +
      matching
        .map(
          ([name, id]) =>
            /* HTML */ `<a class="search-result" href="#${id}" data-search-section
              >${esc(name)}<span>SECTION ↗</span></a
            >`,
        )
        .join("") || '<p class="empty">No matches. Try “Python” or “health”.</p>';
}
$("#search-open").addEventListener("click", () => {
  $("#search-input").value = "";
  search();
  openDialog($("#search-dialog"));
  $("#search-input").focus();
});
$("#search-input").addEventListener("input", search);
$("#search-results").addEventListener("click", (e) => {
  const p = e.target.closest("[data-search-project]");
  if (p) {
    closeDialog($("#search-dialog"));
    openProject(Number(p.dataset.searchProject));
  }
  if (e.target.closest("[data-search-section]")) closeDialog($("#search-dialog"));
});
// ---- ACTIVE CHAPTER NAVIGATION ----
const observer =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              document
                .querySelectorAll(".chapter-nav a")
                .forEach((a) =>
                  a.classList.toggle("current", a.hash === "#" + e.target.id),
                );
              const label = document.querySelector("#chapter-label");
              if (label) label.textContent = e.target.dataset.chapter;
              document
                .querySelectorAll("nav a")
                .forEach((a) =>
                  a.classList.toggle("active", a.hash === "#" + e.target.id),
                );
            }
          }),
        { rootMargin: "-10% 0px -65% 0px" },
      )
    : { observe() {} };
["home", "projects", "story", "expertise", "recognition", "contact"].forEach((id) =>
  observer.observe(document.getElementById(id)),
);
render();

// Featured collection: manual controls keep the visitor in charge.
let featured = 0;
function showFeatured(index = 0) {
  const stage = $("#feature-stage");
  if (!data.projects.length) {
    stage.hidden = true;
    return;
  }
  stage.hidden = false;
  featured = (index + data.projects.length) % data.projects.length;
  const p = data.projects[featured];
  stage.innerHTML = /* HTML */ `<div class="feature-copy">
      <span class="feature-meta"
        >FEATURED RELEASE / ${String(featured + 1).padStart(2, "0")}</span
      >
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <div class="chips">
        ${p.tech
          .slice(0, 4)
          .map((t) => /* HTML */ `<span>${esc(t)}</span>`)
          .join("")}
      </div>
      <button class="button primary" data-project="${featured}">
        Inside the project <span>↗</span>
      </button>
    </div>
    <div class="feature-visual">
      <div class="poster-art">${art(featured)}</div>
      <span class="visual-caption"
        >${p.image ? "PROJECT COVER" : "ILLUSTRATIVE PROJECT CONCEPT"}</span
      >
    </div>
    <div class="feature-controls">
      <span
        >${String(featured + 1).padStart(2, "0")} /
        ${String(data.projects.length).padStart(2, "0")}</span
      ><button
        id="feature-prev"
        aria-label="Previous featured project"
        ${data.projects.length < 2 ? "disabled" : ""}
      >
        ←</button
      ><button
        id="feature-next"
        aria-label="Next featured project"
        ${data.projects.length < 2 ? "disabled" : ""}
      >
        →
      </button>
    </div>`;
  $("#feature-prev").addEventListener("click", () => {
    showFeatured(featured - 1);
    $("#feature-prev").focus({ preventScroll: true });
  });
  $("#feature-next").addEventListener("click", () => {
    showFeatured(featured + 1);
    $("#feature-next").focus({ preventScroll: true });
  });
  stage.classList.remove("changing");
  void stage.offsetWidth;
  stage.classList.add("changing");
}
showFeatured();
$("#hero-count").textContent = String(data.projects.length).padStart(2, "0");
$("#collection-count").textContent =
  `(${String(data.projects.length).padStart(2, "0")})`;
$("#education-count").textContent = `${data.education.length} CHAPTERS`;
$("#intro-projects").innerHTML = data.projects
  .slice(0, 3)
  .map(
    (p, i) =>
      /* HTML */ `<button class="intro-project" data-intro-project="${i}">
        <span>${String(i + 1).padStart(2, "0")}</span
        ><span><strong>${esc(p.title)}</strong><small>${esc(p.tag)}</small></span
        ><span>↗</span>
      </button>`,
  )
  .join("");
$("#intro-open").addEventListener("click", () => openDialog($("#intro-dialog")));
$("#intro-resume").href = data.profile.resume;
$("#intro-contact").addEventListener("click", () => closeDialog($("#intro-dialog")));
$("#intro-projects").addEventListener("click", (e) => {
  const b = e.target.closest("[data-intro-project]");
  if (b) {
    closeDialog($("#intro-dialog"));
    openProject(Number(b.dataset.introProject));
  }
});

// Native dialogs, with a small fallback for older browsers.
let previousFocus = null;
function openDialog(d) {
  previousFocus = document.activeElement;
  if (typeof d.showModal === "function") d.showModal();
  else {
    d.setAttribute("open", "");
    d.setAttribute("data-fallback", "");
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "true");
  }
  document.body.classList.add("dialog-open");
  const target = d.querySelector("input,button,a[href]");
  if (target) target.focus();
}
function closeDialog(d) {
  if (typeof d.close === "function") d.close();
  else d.removeAttribute("open");
  if (!document.querySelector("dialog[open]"))
    document.body.classList.remove("dialog-open");
  if (previousFocus && previousFocus.isConnected)
    previousFocus.focus({ preventScroll: true });
}
document.querySelectorAll("dialog").forEach((d) =>
  d.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]"))
      document.body.classList.remove("dialog-open");
  }),
);
document.addEventListener("keydown", (e) => {
  const fallback = document.querySelector("dialog[data-fallback][open]");
  if (fallback) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog(fallback);
    }
    if (e.key === "Tab") {
      const items = [
        ...fallback.querySelectorAll("button:not([disabled]),a[href],input"),
      ];
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }
});
// Failed custom image URLs fall back to the bundled vector art.
document.addEventListener(
  "error",
  (e) => {
    if (
      e.target instanceof HTMLImageElement &&
      e.target.closest(".poster-art") &&
      !e.target.dataset.fallback
    ) {
      e.target.dataset.fallback = "true";
      e.target.src = "assets/cover-clusters.svg";
    }
  },
  true,
);
