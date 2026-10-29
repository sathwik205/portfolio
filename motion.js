// MOTION AND POINTER EFFECTS
// This file never replaces native scrolling. Effects pause offscreen.
// Respect both the visitor's system preference and the Motion off button.
// Adjust small distances/durations; do not add a continuous rendering loop.
"use strict";

// Entrance: brief, once per session, never a blocking loading screen.
const entrance = document.querySelector(".entrance");
try {
  if (sessionStorage.getItem("sathwik-entered"))
    document.body.classList.add("entrance-skipped");
  sessionStorage.setItem("sathwik-entered", "yes");
} catch {}
setTimeout(() => entrance?.remove(), 1700);
document.addEventListener("keydown", () => entrance?.remove(), { once: true });

// Native scrolling; transforms/opacity only. No perpetual JS animation loop.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = false;
try {
  motionPaused = localStorage.getItem("sathwik-motion") === "paused";
} catch {}
let framePending = false,
  heroVisible = true;
const hero = $("#home");
function requestFrame() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateScene);
  }
}
function updateScene() {
  framePending = false;
  const y = window.scrollY || window.pageYOffset || 0;
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty(
    "--scroll-progress",
    String(distance > 0 ? Math.min(1, y / distance) : 0),
  );
  if (heroVisible && !reducedMotion.matches && !motionPaused && innerWidth > 760) {
    const progress = Math.min(1, y / hero.offsetHeight);
    document.documentElement.style.setProperty(
      "--hero-depth",
      `${Math.round(y * 0.1)}px`,
    );
    document.documentElement.style.setProperty(
      "--hero-opacity",
      String(Math.max(0, 1 - progress * 1.2)),
    );
  } else {
    document.documentElement.style.setProperty("--hero-depth", "0px");
    document.documentElement.style.setProperty("--hero-opacity", "1");
  }
}
function syncMotion() {
  document.body.classList.toggle("motion-paused", motionPaused);
  document.documentElement.classList.toggle("motion-paused", motionPaused);
  $("#motion-toggle").setAttribute("aria-pressed", String(motionPaused));
  $("#motion-toggle").setAttribute(
    "aria-label",
    motionPaused ? "Resume decorative motion" : "Pause decorative motion",
  );
  $("#motion-toggle").innerHTML = motionPaused
    ? "<span>▶</span> Motion off"
    : "<span>Ⅱ</span> Motion on";
  requestFrame();
}
$("#motion-toggle").addEventListener("click", () => {
  motionPaused = !motionPaused;
  try {
    localStorage.setItem("sathwik-motion", motionPaused ? "paused" : "on");
  } catch {}
  syncMotion();
});
window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame, { passive: true });
const motionChange = () => {
  if (reducedMotion.matches)
    document
      .querySelectorAll(".reveal-pending")
      .forEach((e) => e.classList.add("in-view"));
  requestFrame();
};
if (reducedMotion.addEventListener)
  reducedMotion.addEventListener("change", motionChange);
else if (reducedMotion.addListener) reducedMotion.addListener(motionChange);
if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.target === hero) {
          heroVisible = entry.isIntersecting;
          document.body.classList.toggle("hero-visible", heroVisible);
          requestFrame();
        } else entry.target.classList.toggle("scene-visible", entry.isIntersecting);
      }),
    { rootMargin: "60px" },
  );
  sceneObserver.observe(hero);
  sceneObserver.observe($("#contact"));
  sceneObserver.observe($(".ticker"));
  if (!reducedMotion.matches) {
    const reveals = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            reveals.unobserve(entry.target);
          }
        }),
      { threshold: 0.05, rootMargin: "0px 0px -25px 0px" },
    );
    document
      .querySelectorAll(
        ".section-heading,.feature-stage,.portrait-stage,.project-card,.story-title>h2,.identity-card,.story-title>p,.story-title>.text-link,.episode,.skill-group,.stack-detail,.achievement,.certificate,.contact h2,.contact-bottom",
      )
      .forEach((el, i) => {
        if (el.getBoundingClientRect().top < innerHeight) return;
        el.classList.add("reveal-pending");
        el.style.setProperty("--reveal-delay", `${(i % 3) * 55}ms`);
        reveals.observe(el);
      });
  }
} else {
  document.body.classList.add("hero-visible");
  document
    .querySelectorAll(".ticker,.contact")
    .forEach((el) => el.classList.add("scene-visible"));
}
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let pointerFrame = false,
    px = 0,
    py = 0;
  hero.addEventListener(
    "pointermove",
    (e) => {
      if (motionPaused || reducedMotion.matches) return;
      const rect = hero.getBoundingClientRect();
      px = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
      py = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
      if (!pointerFrame) {
        pointerFrame = true;
        requestAnimationFrame(() => {
          hero.style.setProperty("--pointer-x", px + "px");
          hero.style.setProperty("--pointer-y", py + "px");
          pointerFrame = false;
        });
      }
    },
    { passive: true },
  );
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--pointer-x", "0px");
    hero.style.setProperty("--pointer-y", "0px");
  });
}
document.addEventListener("visibilitychange", () =>
  document.documentElement.classList.toggle("tab-hidden", document.hidden),
);
syncMotion();

// Small pointer-driven accents. Delegation also supports newly filtered cards.
// One pending animation frame at most; never a continuous pointer loop.
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
let hoverTarget = null,
  hoverFrame = 0,
  pointerClientX = 0,
  pointerClientY = 0;
function resetHover() {
  if (hoverFrame) {
    cancelAnimationFrame(hoverFrame);
    hoverFrame = 0;
  }
  if (hoverTarget) {
    hoverTarget.classList.remove("is-hovered");
    ["--tilt-x", "--tilt-y", "--mag-x", "--mag-y"].forEach((key) =>
      hoverTarget.style.removeProperty(key),
    );
  }
  hoverTarget = null;
}
function applyPointer() {
  hoverFrame = 0;
  if (
    !hoverTarget ||
    !hoverTarget.isConnected ||
    motionPaused ||
    reducedMotion.matches ||
    !finePointer.matches
  ) {
    resetHover();
    return;
  }
  const box = hoverTarget.getBoundingClientRect();
  const x = Math.max(
    0,
    Math.min(1, (pointerClientX - box.left) / Math.max(box.width, 1)),
  );
  const y = Math.max(
    0,
    Math.min(1, (pointerClientY - box.top) / Math.max(box.height, 1)),
  );
  hoverTarget.style.setProperty("--spot-x", `${x * 100}%`);
  hoverTarget.style.setProperty("--spot-y", `${y * 100}%`);
  if (hoverTarget.classList.contains("portrait-card")) {
    hoverTarget.style.setProperty("--tilt-x", `${(0.5 - y) * 8}deg`);
    hoverTarget.style.setProperty("--tilt-y", `${(x - 0.5) * 10}deg`);
  }
  if (hoverTarget.classList.contains("button")) {
    hoverTarget.style.setProperty("--mag-x", `${(x - 0.5) * 7}px`);
    hoverTarget.style.setProperty("--mag-y", `${(y - 0.5) * 5}px`);
  }
}
document.addEventListener(
  "pointermove",
  (e) => {
    if (
      e.pointerType === "touch" ||
      !finePointer.matches ||
      reducedMotion.matches ||
      motionPaused
    ) {
      resetHover();
      return;
    }
    const target = e.target.closest(".portrait-card,.poster,.button");
    if (target !== hoverTarget) {
      resetHover();
      hoverTarget = target;
      if (target) {
        target.classList.add("is-hovered");
        if (
          target.classList.contains("poster") &&
          !target.querySelector(".hover-follow")
        ) {
          const label = document.createElement("span");
          label.className = "hover-follow";
          label.textContent = "EXPLORE ↗";
          label.setAttribute("aria-hidden", "true");
          target.append(label);
        }
      }
    }
    if (!target) return;
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
    if (!hoverFrame) hoverFrame = requestAnimationFrame(applyPointer);
  },
  { passive: true },
);
document.documentElement.addEventListener("pointerleave", resetHover);
window.addEventListener("blur", resetHover);
window.addEventListener("scroll", resetHover, { passive: true });
document.addEventListener("focusin", resetHover);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) resetHover();
});
$("#motion-toggle").addEventListener("click", resetHover);
const pointerChange = () => {
  resetHover();
  document.body.classList.toggle(
    "pointer-effects",
    finePointer.matches && !reducedMotion.matches,
  );
};
if (finePointer.addEventListener) finePointer.addEventListener("change", pointerChange);
else if (finePointer.addListener) finePointer.addListener(pointerChange);
if (reducedMotion.addEventListener)
  reducedMotion.addEventListener("change", pointerChange);
else if (reducedMotion.addListener) reducedMotion.addListener(pointerChange);
pointerChange();
