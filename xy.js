const root  = document.documentElement;
const sections = [...document.querySelectorAll("main section")];
const links = document.querySelectorAll(".nav-links a");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


function slideTo(target, duration = 1100) {
  const start = window.scrollY;
  const distance = target.getBoundingClientRect().top;

  if (reduceMotion) {
    window.scrollTo(0, start + distance);
    return;
  }

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let t0 = null;

  root.style.scrollSnapType = "none";   

  function step(now) {
    if (!t0) t0 = now;
    const p = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, start + distance * ease(p));

    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      root.style.scrollSnapType = "";
    }
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;               // link without a page
    e.preventDefault();
    slideTo(target);
    history.replaceState(null, "", a.getAttribute("href"));
  });
});


function updateNav() {
  
  const current =
    sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= 70 && r.bottom > 70;
    }) || sections[0];

  document.body.classList.toggle("nav-light", ["about", "info", "contact"].includes(current.id));   

 
  if (current.id !== "info" && document.querySelector(".school-panel.open")) closeInfo(false);

  links.forEach((l) => {
    l.classList.toggle("active", l.getAttribute("href") === "#" + current.id);
  });
}

window.addEventListener("scroll", updateNav, { passive: true });
updateNav();


const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  },
  { threshold: 0.35 }
);

document.querySelectorAll(".about-section").forEach((s) => observer.observe(s));


const infoRows   = document.querySelectorAll(".school-row");
const infoPanels = document.querySelectorAll(".school-panel");

function closeInfo(focusBack = true) {
  infoPanels.forEach((p) => {
    p.classList.remove("open");
    p.setAttribute("aria-hidden", "true");
  });

  infoRows.forEach((r) => {
    const wasActive = r.classList.contains("active");
    r.classList.remove("active");
    r.setAttribute("aria-expanded", "false");
    if (wasActive && focusBack) r.focus({ preventScroll: true });
  });
}

function openInfo(row) {
  closeInfo(false);                                  
  const panel = document.getElementById(row.dataset.target);
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  row.classList.add("active");
  row.setAttribute("aria-expanded", "true");
}

infoRows.forEach((row) => {
  row.addEventListener("click", () => {
    row.classList.contains("active") ? closeInfo() : openInfo(row);
  });

  
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      row.click();
    }
  });
});

document.querySelectorAll(".panel-close").forEach((b) => {
  b.addEventListener("click", () => closeInfo());
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeInfo();
});