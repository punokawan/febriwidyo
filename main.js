const root = document.documentElement;
const themeButton = document.querySelector("[data-theme-toggle]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  themeMeta?.setAttribute("content", theme === "light" ? "#f7f4ec" : "#07110e");
  themeButton?.setAttribute("aria-pressed", String(theme === "light"));
  themeButton?.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} theme`);
}

let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("portfolio-theme") || "dark";
} catch {
  // Storage can be unavailable in privacy-restricted browsing contexts.
}
applyTheme(savedTheme === "light" ? "light" : "dark");

themeButton?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  try {
    localStorage.setItem("portfolio-theme", nextTheme);
  } catch {
    // The visual switch still works when storage is unavailable.
  }
});

const siteHeader = document.querySelector("[data-site-header]");
const updateHeader = () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5%" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const navLinks = [...document.querySelectorAll("[data-nav]")];
const trackedSections = [...document.querySelectorAll("#top, #impact, #work, #publication, #experience, #systems, #contact")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const activeId = visible.target.id === "publication" || visible.target.id === "systems" ? "work" : visible.target.id;
      navLinks.forEach((link) => {
        if (link.dataset.nav === activeId) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-32% 0px -55%", threshold: [0, 0.2, 0.5] }
  );
  trackedSections.forEach((section) => sectionObserver.observe(section));
}

const hero = document.querySelector("[data-hero]");
if (hero && window.matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--pointer-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    hero.style.setProperty("--pointer-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
}

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projectCards = [...document.querySelectorAll(".project-card")];
const projectCount = document.querySelector("[data-project-count]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    projectCards.forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (projectCount) projectCount.textContent = String(visibleCount);
  });
});

const dialog = document.querySelector("[data-project-dialog]");
const dialogImage = dialog?.querySelector("[data-dialog-image]");
const dialogTitle = dialog?.querySelector("[data-dialog-title]");
const dialogType = dialog?.querySelector("[data-dialog-type]");
const dialogDescription = dialog?.querySelector("[data-dialog-description]");
const dialogTech = dialog?.querySelector("[data-dialog-tech]");
let lastProjectTrigger = null;

document.querySelectorAll(".project-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!dialog || typeof dialog.showModal !== "function") return;
    const image = trigger.querySelector("img");
    const title = trigger.querySelector(".project-info > strong")?.textContent || "Project preview";
    const type = trigger.querySelector(".project-type")?.textContent || "Selected system";
    const technologies = [...trigger.querySelectorAll(".project-tech span")].map((item) => item.textContent);

    if (dialogImage && image) {
      dialogImage.src = image.currentSrc || image.src;
      dialogImage.alt = image.alt;
    }
    if (dialogTitle) dialogTitle.textContent = title;
    if (dialogType) dialogType.textContent = type;
    if (dialogDescription) dialogDescription.textContent = trigger.dataset.description || "";
    if (dialogTech) {
      dialogTech.replaceChildren(...technologies.map((technology) => {
        const tag = document.createElement("span");
        tag.textContent = technology;
        return tag;
      }));
    }

    lastProjectTrigger = trigger;
    dialog.showModal();
  });
});

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog?.addEventListener("close", () => {
  if (dialogImage) dialogImage.removeAttribute("src");
  lastProjectTrigger?.focus();
});

const toast = document.querySelector("[data-toast]");
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.querySelector("[data-copy-email]")?.addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.copyEmail;
  try {
    await navigator.clipboard.writeText(email);
    showToast("Email copied to clipboard.");
  } catch {
    showToast("Copy unavailable — use the email link.");
  }
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());
