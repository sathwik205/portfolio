/* PERSONAL COPY
 * Change the words in data.js, not here.
 * Elements with data-content="page.biography", for example, read that field.
 * Text is inserted as text, so HTML in a description cannot become executable.
 */
(() => {
  const portfolio = window.PORTFOLIO;

  function valueAt(path) {
    return path.split(".").reduce((value, key) => value?.[key], portfolio);
  }

  document.querySelectorAll("[data-content]").forEach((element) => {
    const value = valueAt(element.dataset.content);
    if (typeof value === "string") element.textContent = value;
  });

  document.querySelector("#hero-location").textContent =
    `BASED IN ${portfolio.profile.location.toUpperCase()}`;

  const services = document.querySelector("#services");
  services.replaceChildren();
  portfolio.page.services.forEach((name) => {
    const item = document.createElement("span");
    item.textContent = name;
    services.append(item);
  });

  function validPortrait(path) {
    return (
      typeof path === "string" &&
      ((/^assets\/[a-z0-9_./-]+$/i.test(path) && !path.includes("..")) ||
        /^https:\/\//i.test(path))
    );
  }

  document.querySelectorAll("[data-portrait-webp]").forEach((source) => {
    if (validPortrait(portfolio.profile.portraitWebp)) {
      source.srcset = portfolio.profile.portraitWebp;
    } else {
      source.remove(); // Allows a PNG/JPG-only portrait without an old WebP.
    }
  });

  document.querySelectorAll("[data-portrait-png]").forEach((image) => {
    if (validPortrait(portfolio.profile.portraitPng)) {
      image.src = portfolio.profile.portraitPng;
    }
    if (image.alt) image.alt = `Portrait of ${portfolio.profile.name}`;
  });
})();
