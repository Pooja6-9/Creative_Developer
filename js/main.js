/* ══════════════════════════════════════════════
   POOJA JAIN — PORTFOLIO · main.js
   GSAP + ScrollTrigger + Lenis
   ══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isTouch = window.matchMedia("(hover: none)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────────────── SMOOTH SCROLL ── */
let lenis = null;
if (typeof Lenis !== "undefined" && !reduceMotion) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

const scrollTo = (target) => {
  const el = typeof target === "string" ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
};

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id);
  });
});

/* ───────────────────────── CURSOR ── */
const cursor = $("#cursor");
if (!isTouch) {
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };
  window.addEventListener("mousemove", (e) => {
    target.x = e.clientX; target.y = e.clientY;
    cursor.style.opacity = 1;
  });
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.22;
    pos.y += (target.y - pos.y) * 0.22;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
  });
  document.addEventListener("mouseleave", () => (cursor.style.opacity = 0));
  const hoverables = "a, button, .skill, .proj, .chips span, .honor, .ccard";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverables)) cursor.classList.add("is-active");
    if (e.target.closest("input, textarea")) cursor.classList.add("is-text");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverables)) cursor.classList.remove("is-active");
    if (e.target.closest("input, textarea")) cursor.classList.remove("is-text");
  });
}

/* ───────────────────────── LOADER ── */
document.body.classList.add("is-loading");
const loader = $("#loader");
const loaderNum = $("#loaderNum");
const loaderCounter = $("#loaderCounter");
const loaderHello = $("#loaderHello");
const loaderTiles = $("#loaderTiles");

// build tiles
const TILE_COLS = 8, TILE_ROWS = 5;
for (let i = 0; i < TILE_COLS * TILE_ROWS; i++) {
  const t = document.createElement("div");
  t.className = "loader__tile";
  loaderTiles.appendChild(t);
}
const tiles = $$(".loader__tile");

let loaderRan = false;
function runLoader() {
  if (loaderRan) return;
  loaderRan = true;
  const counter = { v: 0 };
  const tl = gsap.timeline({ onComplete: startSite });

  tl.to(counter, {
    v: 100, duration: 2.6, ease: "power2.inOut",
    onUpdate: () => (loaderNum.textContent = Math.round(counter.v) + "%"),
  })
    .to(loaderCounter, { opacity: 0, scale: 0.9, duration: 0.5, ease: "power2.in" })
    .set(loaderHello, { opacity: 1 })
    .to(".loader__hello-text", { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" })
    .to(".loader__hello-text", { fill: "#cbb57a", duration: 0.5 }, "-=0.2")
    .to(loaderHello, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in", delay: 0.35 })
    .to(tiles, {
      scale: 1, duration: 0.55, ease: "power3.out",
      stagger: { each: 0.018, from: "random" },
    }, "-=0.2")
    .set(loader, { background: "#efe9df" })
    .to(loader, { opacity: 0, duration: 0.7, ease: "power2.inOut", delay: 0.1 })
    .set(loader, { display: "none" });
}

function startSite() {
  document.body.classList.remove("is-loading");
  if (lenis) lenis.start();
  heroIntro();
  ScrollTrigger.refresh();
}

if (reduceMotion) {
  loader.style.display = "none";
  startSite();
} else {
  window.addEventListener("load", runLoader);
  // safety: if load takes too long (fonts), start anyway
  setTimeout(runLoader, 5000); // safety: start even if fonts/CDN are slow
}

/* ───────────────────────── HERO ── */
function heroIntro() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero__title", { yPercent: 40, opacity: 0, duration: 1.1 })
    .from(".hero__sub", { y: 30, opacity: 0, duration: 0.8 }, "-=0.6")
    .from(".hero__tags > *", { y: 16, opacity: 0, duration: 0.6, stagger: 0.06 }, "-=0.5")
    .from(".hero__scroll", { y: 14, opacity: 0, duration: 0.6 }, "-=0.4")
    .from(".hero__header > *", { y: -20, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.9")
    .from(".hero__footer > *", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.7");
}

// wavy distortion on hover
const heroTitle = $("#heroTitle");
const turb = $("#wavyTurb");
const disp = $("#wavyDisp");
const wave = { freq: 0, scale: 0, seed: 1 };
let waveTick = null;
function applyWave() {
  turb.setAttribute("baseFrequency", `${wave.freq} ${wave.freq * 0.6}`);
  disp.setAttribute("scale", wave.scale);
}
if (!isTouch && !reduceMotion) {
  heroTitle.addEventListener("mouseenter", () => {
    heroTitle.classList.add("is-wavy");
    gsap.killTweensOf(wave);
    gsap.to(wave, { freq: 0.018, scale: 34, duration: 0.6, ease: "power2.out", onUpdate: applyWave });
    waveTick = waveTick || gsap.ticker.add(() => {
      wave.seed += 0.4;
      turb.setAttribute("seed", Math.floor(wave.seed));
    });
  });
  heroTitle.addEventListener("mouseleave", () => {
    gsap.killTweensOf(wave);
    gsap.to(wave, {
      freq: 0, scale: 0, duration: 0.7, ease: "power2.inOut", onUpdate: applyWave,
      onComplete: () => heroTitle.classList.remove("is-wavy"),
    });
  });
}

/* ───────────────────────── MENU ── */
const menu = $("#menu");
const menuLinks = $$(".menu__link");
let menuOpen = false;

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  menu.classList.add("is-open");
  if (lenis) lenis.stop();
  gsap.timeline()
    .to(menu, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power4.inOut" })
    .to(menuLinks, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" }, "-=0.3");
}
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  if (lenis) lenis.start();
  gsap.timeline({ onComplete: () => menu.classList.remove("is-open") })
    .to(menuLinks, { y: 40, opacity: 0, duration: 0.3, stagger: 0.04, ease: "power2.in" })
    .to(menu, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut" }, "-=0.1");
}
$("#burger").addEventListener("click", openMenu);
$("#menuClose").addEventListener("click", closeMenu);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

/* ───────────────────────── SCROLL REVEALS ── */
function revealUp(targets, opts = {}) {
  $$(targets).forEach((el) => {
    gsap.from(el, {
      y: 50, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      ...opts,
    });
  });
}

// About
gsap.from(".section-head__line", {
  scaleX: 0, duration: 1.2, ease: "power3.inOut",
  scrollTrigger: { trigger: ".about", start: "top 70%", once: true },
});
revealUp(".section-head__label, .section-head__title");
gsap.from("#aboutCard", {
  x: -60, opacity: 0, duration: 1.2, ease: "power3.out",
  scrollTrigger: { trigger: ".about__grid", start: "top 75%", once: true },
});
gsap.from(".about__content > *", {
  y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
  scrollTrigger: { trigger: ".about__grid", start: "top 70%", once: true },
});

// Expertise
revealUp(".expertise__title, .expertise__lead, .expertise__desc, .expertise__left .chips");
gsap.from(".skill", {
  x: 60, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
  scrollTrigger: { trigger: ".skills", start: "top 75%", once: true },
});

// floating icons
if (!reduceMotion) {
  $$(".ficon").forEach((icon, i) => {
    gsap.to(icon, {
      x: () => gsap.utils.random(-40, 40),
      y: () => gsap.utils.random(-30, 30),
      rotation: () => gsap.utils.random(-18, 18),
      duration: () => gsap.utils.random(3, 5),
      ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true,
      delay: i * 0.25,
    });
  });
  if (!isTouch) {
    const left = $(".expertise__left");
    left.addEventListener("mousemove", (e) => {
      const r = left.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      gsap.to("#floatIcons", { x: dx * 30, y: dy * 24, duration: 0.8, ease: "power2.out" });
    });
  }
}

// Journal
revealUp(".journal__head > *, .tl, .honor", { y: 40 });

// Work intro
revealUp(".work-intro__scroll");
gsap.from(".work-svg__text", {
  yPercent: 30, opacity: 0, duration: 1.2, ease: "power3.out",
  scrollTrigger: { trigger: ".work-intro", start: "top 60%", once: true },
});

/* ───────────────────────── WORK DRIPS (goo) ── */
(function buildDrips() {
  const g = $("#drips");
  if (!g) return;
  const NS = "http://www.w3.org/2000/svg";
  const baseline = 330;              // text baseline in viewBox
  const spots = [215, 290, 390, 470, 560, 640, 720, 805, 905, 985];
  spots.forEach((x, i) => {
    // main drip blob (hangs from letter bottom)
    const d = document.createElementNS(NS, "circle");
    d.setAttribute("cx", x);
    d.setAttribute("cy", baseline - 8);
    d.setAttribute("r", 14 + (i % 3) * 5);
    g.appendChild(d);
    // falling droplet
    const drop = document.createElementNS(NS, "circle");
    drop.setAttribute("cx", x + (i % 2 ? 10 : -10));
    drop.setAttribute("cy", baseline - 4);
    drop.setAttribute("r", 6 + (i % 2) * 3);
    g.appendChild(drop);
    if (reduceMotion) return;
    gsap.to(d, {
      attr: { cy: baseline + 22 + (i % 4) * 10, r: 10 + (i % 3) * 4 },
      duration: 2.2 + (i % 3) * 0.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.18,
    });
    gsap.fromTo(drop,
      { attr: { cy: baseline - 4, r: 0 } },
      {
        attr: { cy: baseline + 90 + (i % 3) * 25, r: 7 + (i % 2) * 3 },
        duration: 2.4 + (i % 4) * 0.5, ease: "power1.in", repeat: -1, delay: i * 0.5,
      });
  });
})();

/* ───────────────────────── PROJECT STACK ── */
const projects = $$(".proj");
projects.forEach((card, i) => {
  const next = projects[i + 1];
  if (!next) return;
  gsap.to(card, {
    scale: 0.92, filter: "brightness(0.55)", transformOrigin: "center top",
    ease: "none",
    scrollTrigger: {
      trigger: next, start: "top 90%", end: "top 8%", scrub: true,
    },
  });
});
revealUp(".projects__title");

if (isTouch) {
  projects.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      projects.forEach((c) => c !== card && c.classList.remove("is-touched"));
      card.classList.toggle("is-touched");
    });
  });
}

/* ───────────────────────── CONTACT ── */
revealUp(".contact__left > *, .cform", { y: 40 });
gsap.from(".contact__ghost", {
  yPercent: 30, opacity: 0, duration: 1.2, ease: "power3.out",
  scrollTrigger: { trigger: ".contact", start: "top 70%", once: true },
});

const form = $("#contactForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get("name") || "";
  const email = data.get("email") || "";
  const message = data.get("message") || "";
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
  window.location.href = `mailto:pooja.jain06092005@gmail.com?subject=${subject}&body=${body}`;
  const btn = $(".cform__btn");
  btn.classList.add("is-sent");
  btn.innerHTML = "Opening your mail app <i>✓</i>";
  setTimeout(() => { btn.classList.remove("is-sent"); btn.innerHTML = "Send Message <i>↗</i>"; }, 3500);
});

/* ───────────────────────── MISC ── */
window.addEventListener("resize", () => ScrollTrigger.refresh());
