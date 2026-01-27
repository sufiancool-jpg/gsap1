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
const heroSlideDuration = 0;
const heroRevealRatio = heroRevealDuration / (heroRevealDuration + heroSlideDuration);

const header = document.querySelector(".site-header");
const logo = document.querySelector(".logo");
const brand = document.querySelector(".site-brand");
let logoTarget = { x: 0, y: 0, scale: 1 };

const computeLogoTarget = () => {
  if (!logo || !brand) return;
  gsap.set(logo, { x: 0, y: 0, scale: 1 });
  const headerY = header ? gsap.getProperty(header, "y") : 0;
  if (header) {
    gsap.set(header, { y: 0 });
  }
  const logoRect = logo.getBoundingClientRect();
  const logoStyles = getComputedStyle(logo);
  const logoFontSize = parseFloat(logoStyles.fontSize) || 0;
  const logoLetterSpacing = parseFloat(logoStyles.letterSpacing) || 0;

  let brandRect = brand.getBoundingClientRect();
  let scale = brandRect.height / logoRect.height;

  if (logoFontSize) {
    brand.style.fontSize = `${logoFontSize * scale}px`;
  }
  brand.style.letterSpacing = `${logoLetterSpacing * scale}px`;

  brandRect = brand.getBoundingClientRect();
  scale = brandRect.height / logoRect.height;
  logoTarget = {
    x: brandRect.left - logoRect.left,
    y: brandRect.top - logoRect.top,
    scale,
  };
  if (header) {
    gsap.set(header, { y: headerY });
  }
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
    end: "+=140%",
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
  .set(".logo", { autoAlpha: 0 }, heroRevealDuration)
  .set(".site-brand", { autoAlpha: 1 }, heroRevealDuration);

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

const horizSection = document.querySelector(".horizontal-scroll-section");
const horizContainer = document.querySelector(".horizontal-scroll-container");
const panels = gsap.utils.toArray(".panel");

if (horizSection && horizContainer && panels.length) {
  const getScrollWidth = () => horizContainer.scrollWidth - window.innerWidth;
  const getHold = () => window.innerWidth * 1.6;

  const horizontalScroll = gsap.to(horizContainer, {
    x: () => -getScrollWidth(),
    ease: "none",
    scrollTrigger: {
      trigger: horizSection,
      start: "top top",
      end: () => `+=${getScrollWidth() + getHold()}`,
      scrub: 1,
      pin: true,
      pinType: "transform",
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  const panel1 = document.querySelector(".panel-1");
  const panel1Copy = panel1?.querySelector(".panel-copy");

  if (panel1Copy) {
    gsap.from(panel1Copy, {
      y: 80,
      autoAlpha: 0,
      scrollTrigger: {
        trigger: panel1,
        containerAnimation: horizontalScroll,
        start: "left 70%",
        end: "left 35%",
        scrub: true,
      },
    });
  }

  const panel2 = document.querySelector(".panel-2");
  const panel2Copy = panel2?.querySelector(".panel-copy");
  if (panel2Copy) {
    gsap.from(panel2Copy, {
      x: 120,
      autoAlpha: 0,
      scrollTrigger: {
        trigger: panel2,
        containerAnimation: horizontalScroll,
        start: "left 70%",
        end: "left 30%",
        scrub: true,
      },
    });
  }

  const panel3 = document.querySelector(".panel-3");
  const panel3Copy = panel3?.querySelector(".panel-copy");
  if (panel3Copy) {
    gsap.from(panel3Copy, {
      x: 140,
      autoAlpha: 0,
      scrollTrigger: {
        trigger: panel3,
        containerAnimation: horizontalScroll,
        start: "left 70%",
        end: "left 30%",
        scrub: true,
      },
    });
  }

  const mediaWindow = document.querySelector(".media-window");
  if (mediaWindow) {
    gsap.set(mediaWindow, {
      xPercent: 120,
      yPercent: -50,
      scale: 0.85,
      visibility: "visible",
    });

    const windowTl = gsap.timeline({
      scrollTrigger: {
        trigger: panel3,
        containerAnimation: horizontalScroll,
        start: "left 98%",
        end: "right 15%",
        scrub: true,
      },
    });

    windowTl
      .to(mediaWindow, {
        xPercent: 0,
        scale: 1,
        duration: 0.45,
        ease: "none",
      })
      .to(mediaWindow, {
        top: 0,
        right: 0,
        width: "100%",
        height: "100%",
        borderRadius: 0,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        borderWidth: 0,
        yPercent: 0,
        duration: 0.55,
        ease: "none",
      });

    const frameSources = [
      "./photos/Architektur_1.jpg",
      "./photos/Architektur_2.jpg",
      "./photos/Architektur_3.jpg",
      "./photos/Architektur_4.jpg",
      "./photos/Architektur_5.jpg",
      "./photos/Architektur_6.jpg",
      "./photos/Architektur_7.jpg",
      "./photos/Architektur_8.jpg",
      "./photos/Architektur_9.jpg",
    ];
    let frameIndex = 0;
    const frameDelay = 500;
    const updateFrame = () => {
      mediaWindow.style.backgroundImage = `url(${frameSources[frameIndex]})`;
      frameIndex = (frameIndex + 1) % frameSources.length;
    };
    updateFrame();
    setInterval(updateFrame, frameDelay);
  }

  const panel5 = document.querySelector(".panel-5");
  const panel5Copy = panel5?.querySelector(".panel-copy");
  if (panel5Copy && windowTl) {
    gsap.set(panel5Copy, { autoAlpha: 0, x: 140 });
    windowTl.to(panel5Copy, {
      autoAlpha: 1,
      x: 0,
      duration: 0.15,
      ease: "none",
    }, ">-0.02");
  }

  if (mediaWindow && panel5Copy) {
    gsap.to([mediaWindow, panel5Copy], {
      autoAlpha: 0,
      scrollTrigger: {
        trigger: panel5,
        containerAnimation: horizontalScroll,
        start: "right 30%",
        end: "right 0%",
        scrub: true,
      },
    });
  }
}

gsap.to("body", {
  "--bg": "#fff",
  "--text": "#000",
  "--nav-base": "#000",
  "--nav-fill": "#000",
  "--nav-invert": "#fff",
  scrollTrigger: {
    trigger: ".horizontal-scroll-section",
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
