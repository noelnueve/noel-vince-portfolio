const pageBody = document.body;
const themeButtons = document.querySelectorAll("[data-theme]");
const navLinks = document.querySelectorAll(".nav-links a");
const sectionNavLinks = [...navLinks].filter((link) => (
  link.hash
  && link.origin === window.location.origin
  && link.pathname === window.location.pathname
));
const trackedSections = sectionNavLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  const showFallback = () => image.classList.add("is-missing");

  if (image.complete && image.naturalWidth === 0) {
    showFallback();
  } else {
    image.addEventListener("error", showFallback, { once: true });
  }
});

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const useLightTheme = button.dataset.theme === "light";
    pageBody.classList.toggle("light-theme", useLightTheme);
    themeButtons.forEach((themeButton) => {
      themeButton.setAttribute("aria-pressed", String(themeButton === button));
    });
  });
});

const activeSectionObserver = new IntersectionObserver((entries) => {
  const visibleEntry = entries
    .filter((entry) => entry.isIntersecting)
    .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

  if (!visibleEntry) return;

  sectionNavLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${visibleEntry.target.id}`);
  });
}, {
  rootMargin: "-25% 0px -55%",
  threshold: [0, 0.25, 0.5]
});

trackedSections.forEach((section) => activeSectionObserver.observe(section));
