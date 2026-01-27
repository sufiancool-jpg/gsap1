import { gsap } from "./src/index.js";
import ScrollTrigger from "./src/ScrollTrigger.js";
import ScrollSmoother from "./src/ScrollSmoother.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const smoother = ScrollSmoother.create({
  wrapper: "#smooth-wrapper",
  content: "#smooth-content",
  smooth: prefersReducedMotion ? 0 : 1.15,
  effects: !prefersReducedMotion,
  normalizeScroll: true,
});

const heroRevealDuration = 1;
const heroSlideDuration = 1;
const heroRevealRatio = heroRevealDuration / (heroRevealDuration + heroSlideDuration);

const header = document.querySelector(".site-header");
const logo = document.querySelector(".logo");
const brand = document.querySelector(".site-brand");
let logoTarget = { x: 0, y: 0, scale: 1 };

const computeLogoTarget = () => {
  if (!logo || !brand) return;
  gsap.set(logo, { x: 0, y: 0, scale: 1 });
  const logoRect = logo.getBoundingClientRect();
  const brandRect = brand.getBoundingClientRect();
  const scale = brandRect.height / logoRect.height;
  logoTarget = {
    x: brandRect.left - logoRect.left,
    y: brandRect.top - logoRect.top,
    scale,
  };
};

ScrollTrigger.addEventListener("refreshInit", computeLogoTarget);
computeLogoTarget();
if (header) {
  gsap.set(header, { autoAlpha: 0, y: -12 });
}
if (brand) {
  gsap.set(brand, { autoAlpha: 0 });
}

const cta = document.querySelector(".scroll-cta");
if (cta) {
  gsap.set(cta, { autoAlpha: 0, y: 16 });
  gsap.to(cta, {
    autoAlpha: 1,
    y: 0,
    delay: 3,
    duration: 0.8,
    ease: "power3.out",
  });

  gsap.to(".mouse .wheel", {
    y: 8,
    repeat: -1,
    yoyo: true,
    duration: 0.9,
    ease: "power1.inOut",
  });
}

const logoButton = document.querySelector(".logo-button");
if (logoButton) {
  const goToVideo = () => {
    const heroTrigger = ScrollTrigger.getById("hero");
    if (!heroTrigger) return;
    const target =
      heroTrigger.start + (heroTrigger.end - heroTrigger.start) * heroRevealRatio;
    if (smoother) {
      gsap.to(smoother, {
        scrollTop: target,
        duration: 2.2,
        ease: "power3.inOut",
        overwrite: "auto",
        onUpdate: ScrollTrigger.update,
      });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  };

  logoButton.addEventListener("click", goToVideo);
  logoButton.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToVideo();
    }
  });
}

const navButtons = gsap.utils.toArray(".nav-button");
navButtons.forEach((button) => {
  const fill = button.querySelector(".btn-fill");
  if (!fill) return;

  gsap.set(fill, {
    x: button.clientWidth / 2,
    y: button.clientHeight / 2,
    transformOrigin: "center center",
  });

  const setX = gsap.quickTo(fill, "x", { duration: 0.25, ease: "power2.out" });
  const setY = gsap.quickTo(fill, "y", { duration: 0.25, ease: "power2.out" });
  const setScale = gsap.quickTo(fill, "scale", { duration: 0.45, ease: "power3.out" });
  const setAlpha = gsap.quickTo(fill, "autoAlpha", { duration: 0.35, ease: "power2.out" });

  let fillTl;

  const moveFill = (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setX(x);
    setY(y);
  };

  button.addEventListener("pointerenter", (event) => {
    moveFill(event);
    button.classList.add("is-hover");
    fillTl?.kill();
    fillTl = gsap.timeline();
    fillTl
      .set(fill, { scale: 0.05, autoAlpha: 0 })
      .to(fill, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 0)
      .to(fill, { scale: 1.2, duration: 0.8, ease: "power3.out" }, 0)
      .to(fill, { scale: 0.95, duration: 0.55, ease: "sine.out" }, 0.6);
  });

  button.addEventListener("pointermove", moveFill);

  const resetFill = () => {
    button.classList.remove("is-hover");
    fillTl?.kill();
    setScale(0);
    setAlpha(0);
  };

  button.addEventListener("pointerleave", resetFill);
  button.addEventListener("pointercancel", resetFill);
  button.addEventListener("pointerup", resetFill);
  window.addEventListener("blur", resetFill);
});

const aboutLink = document.querySelector('a[href="#about"]');
const aboutSection = document.querySelector("#about");
if (aboutLink && aboutSection) {
  aboutLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (smoother) {
      const target = smoother.offset("#about", "top top");
      gsap.to(smoother, {
        scrollTop: target,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: ScrollTrigger.update,
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else {
      const aboutEl = document.querySelector("#about");
      if (aboutEl) {
        aboutEl.scrollIntoView({ behavior: "smooth" });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    }
  });
}

gsap.set(".video-frame", {
  yPercent: 120,
  scale: 0.7,
  rotateX: 12,
  rotateY: 0,
  transformOrigin: "center center",
});

const heroTl = gsap.timeline({
  scrollTrigger: {
    id: "hero",
    trigger: ".stage",
    start: "top top",
    end: "+=240%",
    scrub: true,
    pin: true,
    anticipatePin: 1,
  },
});

heroTl
  .to(
    ".logo",
    {
      x: () => logoTarget.x,
      y: () => logoTarget.y,
      scale: () => logoTarget.scale,
      transformOrigin: "left top",
      duration: heroRevealDuration,
      ease: "power2.out",
    },
    0
  )
  .to(
    ".video-frame",
    {
      yPercent: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      borderRadius: 0,
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.55)",
      duration: heroRevealDuration,
      ease: "power2.out",
    },
    0
  )
  .fromTo(
    ".hero-video",
    { scale: 1.1 },
    { scale: 1, duration: heroRevealDuration, ease: "none" },
    0
  )
  .to(
    ".logo",
    {
      autoAlpha: 0,
      duration: 0.2,
      ease: "power1.out",
    },
    heroRevealDuration - 0.05
  )
  .to(
    ".site-brand",
    {
      autoAlpha: 1,
      duration: 0.2,
      ease: "power1.out",
    },
    heroRevealDuration - 0.05
  )
  .to(
    ".hero-track",
    {
      xPercent: -50,
      ease: "none",
      duration: heroSlideDuration,
    },
    heroRevealDuration
  );

if (header) {
  heroTl.to(
    header,
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.25,
      ease: "power2.out",
    },
    heroRevealDuration - 0.35
  );
}

const video = document.querySelector(".hero-video");
const fallback = document.querySelector(".video-fallback");
if (video && fallback) {
  video.addEventListener("canplay", () => fallback.classList.add("is-hidden"));
}

gsap.to("body", {
  "--bg": "#fff",
  "--text": "#000",
  "--nav-base": "#000",
  "--nav-fill": "#000",
  "--nav-invert": "#fff",
  scrollTrigger: {
    trigger: ".about",
    start: "top 80%",
    end: "top 35%",
    scrub: true,
  },
});

gsap.from(".about-inner", {
  opacity: 0,
  y: 80,
  rotateX: 10,
  transformOrigin: "center top",
  scrollTrigger: {
    trigger: ".about",
    start: "top 70%",
    end: "top 40%",
    scrub: true,
  },
});

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
