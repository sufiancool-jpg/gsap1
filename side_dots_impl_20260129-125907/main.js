import { gsap } from "./src/index.js";
import InertiaPlugin from "./src/InertiaPlugin.js";
import ScrollTrigger from "./src/ScrollTrigger.js";
import ScrollSmoother from "./src/ScrollSmoother.js";
import SplitText from "./src/SplitText.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, InertiaPlugin);
window.gsap = gsap;

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
const logoFull = logo ? logo.querySelector(".logo-full") : null;
const logoInitial = logo ? logo.querySelector(".logo-initial") : null;
const brand = document.querySelector(".site-brand");
let logoTarget = { x: 0, y: 0, scale: 1 };
const body = document.body;
const showHeaderNow = () => {
  if (!header) return;
  gsap.to(header, {
    autoAlpha: 1,
    y: 0,
    duration: 0.25,
    ease: "power2.out",
  });
};
const hideHeaderNow = () => {
  if (!header) return;
  gsap.to(header, {
    autoAlpha: 0,
    y: -12,
    duration: 0.25,
    ease: "power2.out",
  });
};
const matteRoot = document.documentElement;
let matteInset = 0;
let matteAllowed = true;
let matteEnabled = false;
const matteMq = window.matchMedia("(max-width: 1024px)");
const phoneMq = window.matchMedia("(max-width: 700px)");
const enableMatte = (on) => {
  matteEnabled = on && matteAllowed;
  matteRoot.classList.toggle("matte-on", matteEnabled);
};
const setMatteState = ({ inset, radius }) => {
  if (!matteAllowed) {
    gsap.set(matteRoot, {
      "--matte-safe": "0px",
      "--matte-inset": "0px",
      "--matte-radius": "0px",
    });
    return;
  }
  const nextInset = Number(inset);
  if (!Number.isNaN(nextInset) && nextInset !== matteInset) {
    matteInset = nextInset;
    gsap.set(matteRoot, {
      "--matte-safe": `${nextInset}px`,
      "--matte-inset": `${nextInset}px`,
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  if (radius != null) {
    gsap.to(matteRoot, {
      "--matte-radius": `${radius}px`,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
    });
  }
};
const updateMatteAllowance = () => {
  matteAllowed = !matteMq.matches;
  if (!matteAllowed) {
    enableMatte(false);
    setMatteState({ inset: 0, radius: 0 });
  }
};
if (matteMq && matteMq.addEventListener) {
  matteMq.addEventListener("change", updateMatteAllowance);
}
updateMatteAllowance();
enableMatte(false);
setMatteState({ inset: 0, radius: 0 });
const isPhone = () => (phoneMq ? phoneMq.matches : false);
const setThemeLight = () => {
  if (body) body.classList.add("theme-light");
};
const setThemeDark = () => {
  if (body) body.classList.remove("theme-light");
};

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
    x: Math.round(brandRect.left - logoRect.left),
    y: Math.round(brandRect.top - logoRect.top),
    scale: Number(scale.toFixed(4)),
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

let logoSplit;
let logoIntroPlayed = false;
const animateLogoIntro = () => {
  if (logoIntroPlayed) return;
  if (!logo) return;
  logoIntroPlayed = true;
  if (logoSplit && logoSplit.revert) {
    logoSplit.revert();
  }
  logoSplit = null;
  const target = logoFull || logo;
  gsap.set(target, { autoAlpha: 1 });
  if (logoInitial) {
    gsap.set(logoInitial, { autoAlpha: 1, scale: 1 });
  }

  try {
    logoSplit = new SplitText(target, {
      type: "chars",
      charsClass: "logo-char",
      tag: "span",
    });
  } catch (error) {
    gsap.from(target, { autoAlpha: 0, y: 8, duration: 0.5, ease: "power1.out" });
    return;
  }

  const chars = logoSplit.chars || [];
  if (!chars.length) {
    gsap.from(target, { autoAlpha: 0, y: 8, duration: 0.5, ease: "power1.out" });
    return;
  }

  let initialCenterX = null;
  let initialDeltaX = 0;
  if (logoInitial) {
    const initialRect = logoInitial.getBoundingClientRect();
    initialCenterX = initialRect.left + initialRect.width / 2;
  }

  const offsets = chars.map((char) => {
    if (initialCenterX === null) return 0;
    const rect = char.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    return initialCenterX - centerX;
  });

  if (logoInitial && chars[0]) {
    const firstRect = chars[0].getBoundingClientRect();
    const initialRect = logoInitial.getBoundingClientRect();
    initialDeltaX = (firstRect.left + firstRect.width / 2) - (initialRect.left + initialRect.width / 2);
  }

  gsap.set(chars, {
    autoAlpha: 0,
    x: (index) => (offsets[index] == null ? 0 : offsets[index]),
  });

  const tl = gsap.timeline();
  if (logoInitial) {
    tl.to(logoInitial, {
      scale: 1.08,
      duration: 0.28,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 3,
      repeatDelay: 0.06,
    });
  }

  tl.to(
    logoInitial || target,
    {
      x: initialDeltaX,
      duration: 0.6,
      ease: "power2.out",
    },
    "reveal"
  )
    .to(
      chars,
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.03,
      },
      "reveal+=0.02"
    )
    .to(
      logoInitial || target,
      {
        autoAlpha: logoInitial ? 0 : 1,
        duration: 0.25,
        ease: "power1.out",
      },
      "reveal+=0.45"
    );
};

if (logo) {
  const runLogoIntro = () => requestAnimationFrame(animateLogoIntro);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(runLogoIntro);
    setTimeout(runLogoIntro, 1200);
    document.fonts.ready.then(() => {
      computeLogoTarget();
      ScrollTrigger.refresh();
    });
  } else {
    window.addEventListener("load", runLogoIntro, { once: true });
  }
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

  const setX = gsap.quickTo(fill, "x", { duration: 0.12, ease: "power2.out" });
  const setY = gsap.quickTo(fill, "y", { duration: 0.12, ease: "power2.out" });
  const setScale = gsap.quickTo(fill, "scale", { duration: 0.4, ease: "power3.out" });
  const setAlpha = gsap.quickTo(fill, "autoAlpha", { duration: 0.25, ease: "power2.out" });

  let fillTl;

  const moveFill = (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setX(x);
    setY(y);
  };

  button.addEventListener("pointerenter", (event) => {
    const rect = button.getBoundingClientRect();
    gsap.set(fill, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    button.classList.add("is-hover");
    if (fillTl) fillTl.kill();
    fillTl = gsap.timeline();
    fillTl
      .set(fill, { scale: 0.05, autoAlpha: 0 })
      .to(fill, { autoAlpha: 1, duration: 0.18, ease: "power1.out" }, 0)
      .to(fill, { scale: 1.6, duration: 0.7, ease: "power3.out" }, 0)
      .to(fill, { scale: 1.15, duration: 0.45, ease: "sine.out" }, 0.55);
  });

  button.addEventListener("pointermove", moveFill);

  const resetFill = () => {
    button.classList.remove("is-hover");
    if (fillTl) fillTl.kill();
    setScale(0);
    setAlpha(0);
  };

  button.addEventListener("pointerleave", resetFill);
  button.addEventListener("pointercancel", resetFill);
  window.addEventListener("blur", resetFill);
});


const stageSection = document.querySelector(".stage");
if (stageSection) {
  ScrollTrigger.create({
    trigger: stageSection,
    start: "top top",
    end: "bottom top",
    onEnter: () => {
      enableMatte(false);
      setMatteState({ inset: 0, radius: 0 });
      if (!isPhone()) hideHeaderNow();
    },
    onEnterBack: () => {
      enableMatte(false);
      setMatteState({ inset: 0, radius: 0 });
      if (!isPhone()) hideHeaderNow();
    },
  });
}

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

if (aboutSection) {
  ScrollTrigger.create({
    trigger: aboutSection,
    start: "top 70%",
    onEnter: setThemeDark,
    onEnterBack: setThemeDark,
    onLeaveBack: setThemeLight,
  });

  ScrollTrigger.create({
    trigger: aboutSection,
    start: "top 55%",
    onEnter: () => {
      matteRoot.style.removeProperty("--logo-color");
      if (isPhone()) {
        hideHeaderNow();
      } else {
        showHeaderNow();
      }
    },
    onEnterBack: () => {
      matteRoot.style.removeProperty("--logo-color");
      if (isPhone()) {
        hideHeaderNow();
      } else {
        showHeaderNow();
      }
    },
    onLeaveBack: () => {
      if (isPhone()) {
        showHeaderNow();
      }
    },
  });

  ScrollTrigger.create({
    trigger: aboutSection,
    start: "top 70%",
    onEnter: () => {
      enableMatte(true);
      setMatteState({ inset: 28, radius: 26 });
    },
    onEnterBack: () => {
      enableMatte(true);
      setMatteState({ inset: 28, radius: 26 });
    },
  });
}

gsap.set(".video-frame", {
  yPercent: 120,
  scale: 0.7,
  rotateX: 12,
  rotateY: 0,
  transformOrigin: "center center",
  autoAlpha: 0,
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
      autoAlpha: 1,
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
  if (isPhone()) {
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

  ScrollTrigger.create({
    trigger: horizSection,
    start: "top top",
    end: () => `+=${getScrollWidth() + getHold()}`,
    onEnter: setThemeLight,
    onEnterBack: setThemeLight,
    onLeaveBack: setThemeDark,
  });

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
  const panel1Hero = panel1 ? panel1.querySelector(".film-hero") : null;
  const panel1Body = panel1 ? panel1.querySelector(".film-sub") : null;
  const panel1Tail = panel1 ? panel1.querySelector(".film-tail") : null;

  if (panel1Hero) {
    const heroLines = gsap.utils.toArray(".film-hero p");
    gsap.from(heroLines, {
      y: 24,
      autoAlpha: 0,
      stagger: 0.05,
      scrollTrigger: {
        trigger: panel1,
        containerAnimation: horizontalScroll,
        start: "left 75%",
        end: "left 55%",
        scrub: true,
      },
    });
  }

  if (panel1Body) {
    gsap.from(panel1Body, {
      y: 40,
      autoAlpha: 0,
      x: 40,
      scrollTrigger: {
        trigger: panel1,
        containerAnimation: horizontalScroll,
        start: "left 62%",
        end: "left 36%",
        scrub: true,
      },
    });
  }

  if (panel1Tail) {
    gsap.from(panel1Tail, {
      y: 30,
      autoAlpha: 0,
      x: 60,
      scrollTrigger: {
        trigger: panel1,
        containerAnimation: horizontalScroll,
        start: "left 50%",
        end: "left 22%",
        scrub: true,
      },
    });
  }

  const parallax = document.querySelector(".horiz-parallax");
  if (parallax) {
    gsap.fromTo(
      parallax,
      { xPercent: -30 },
      {
        xPercent: 35,
        ease: "none",
        scrollTrigger: {
          trigger: horizSection,
          containerAnimation: horizontalScroll,
          start: "left left",
          end: "right right",
          scrub: 0.6,
        },
      }
    );
  }

  const panel2 = document.querySelector(".panel-2");
  const panel2Copy = panel2 ? panel2.querySelector(".panel-copy") : null;
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
  const panel3Copy = panel3 ? panel3.querySelector(".panel-copy") : null;
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

  let windowTl;
  const mediaWindow = document.querySelector("#slideshow1");
  if (mediaWindow) {
    gsap.set(mediaWindow, {
      xPercent: 160,
      yPercent: -50,
      scale: 0.85,
      autoAlpha: 0,
    });

    windowTl = gsap.timeline({
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
        autoAlpha: 1,
        duration: 0.45,
        ease: "none",
      })
      .to(mediaWindow, {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: 0,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        borderWidth: 0,
        xPercent: 0,
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
    const updateFrame = () => {
      mediaWindow.style.backgroundImage = `url(${frameSources[frameIndex]})`;
      frameIndex = (frameIndex + 1) % frameSources.length;
    };
    updateFrame();

    let lastFrameTime = 0;
    let targetFps = 12;
    const maxFps = 12;
    const minFps = 5;

    const updateFps = () => {
      const progress = windowTl ? windowTl.progress() : 0;
      targetFps = gsap.utils.interpolate(maxFps, minFps, progress);
    };

    updateFps();

    gsap.ticker.add(() => {
      if (prefersReducedMotion) return;
      updateFps();
      const now = gsap.ticker.time;
      const interval = 1 / targetFps;
      if (now - lastFrameTime >= interval) {
        lastFrameTime = now;
        updateFrame();
      }
    });
  }

  const panel5 = document.querySelector(".panel-5");
  const panel5Copy = panel5 ? panel5.querySelector(".panel-copy") : null;
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

const pillarsSection = document.querySelector(".pillars-section");
const pillarsRail = pillarsSection ? pillarsSection.querySelector("#rail") : null;
const pillarsDots = pillarsSection ? [...pillarsSection.querySelectorAll(".status__item")] : [];
const pillarsCanvas = pillarsSection ? pillarsSection.querySelector("#bgCanvas") : null;

if (pillarsSection && pillarsRail) {
  const clampValue = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerpValue = (a, b, t) => a + (b - a) * t;
  const designW = 1440;
  const designH = 900;

  const updateScale = () => {
    const availableW = pillarsSection.clientWidth || window.innerWidth;
    const availableH = pillarsSection.clientHeight || window.innerHeight;
    const scale = Math.min(1, availableW / designW, availableH / designH);
    const padX = Math.max(0, (availableW - designW) / 2);
    pillarsSection.style.setProperty("--scale", scale.toFixed(3));
    pillarsSection.style.setProperty("--padX", `${padX.toFixed(0)}px`);
  };

  updateScale();

  let targetProgress = 0;
  let smoothProgress = 0;
  let lens = null;
  let renderer = null;
  let camera = null;
  let scene = null;
  let lastX = 0;
  let roll = 0;

  let pillarsActive = false;
  const updateTheme = (progress) => {
    const idx = Math.round(progress * 3);
    pillarsDots.forEach((dot) => {
      dot.classList.toggle("is-active", Number(dot.dataset.i) === idx);
    });

    const darkT = clampValue((progress - 0.5) * 2, 0, 1);
    pillarsSection.style.setProperty(
      "--bgA",
      `rgb(${lerpValue(255, 12, darkT)},${lerpValue(255, 15, darkT)},${lerpValue(255, 20, darkT)})`
    );
    pillarsSection.style.setProperty(
      "--bgB",
      `rgb(${lerpValue(242, 27, darkT)},${lerpValue(242, 34, darkT)},${lerpValue(242, 48, darkT)})`
    );
    pillarsSection.style.setProperty("--fg", darkT < 0.5 ? "#0b0b0b" : "#ffffff");
    pillarsSection.style.setProperty(
      "--dotOff",
      darkT < 0.5 ? "rgba(0,0,0,.25)" : "rgba(255,255,255,.35)"
    );
    pillarsSection.style.setProperty("--dotOn", darkT < 0.5 ? "rgba(0,0,0,.85)" : "#ffffff");

    if (pillarsActive) {
      const logoTone = Math.round(lerpValue(11, 255, darkT));
      matteRoot.style.setProperty(
        "--logo-color",
        `rgb(${logoTone}, ${logoTone}, ${logoTone})`
      );
    }
  };

  updateTheme(0);

  const getScrollDistance = () =>
    Math.max(pillarsSection.clientHeight, pillarsSection.clientWidth) * 3;
  const getRailShift = () => pillarsSection.clientWidth * 3;

  ScrollTrigger.create({
    trigger: pillarsSection,
    start: "top 95%",
    end: "top top",
    onEnter: () => {
      if (!isPhone()) hideHeaderNow();
    },
    onEnterBack: () => {
      if (!isPhone()) hideHeaderNow();
    },
    onLeaveBack: () => {
      if (!isPhone()) hideHeaderNow();
    },
  });

  gsap.to(pillarsRail, {
    x: () => -getRailShift(),
    ease: "none",
    scrollTrigger: {
      trigger: pillarsSection,
      start: "top top",
      end: () => `+=${getScrollDistance()}`,
      scrub: true,
      pin: true,
      pinType: "transform",
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetProgress = self.progress;
      },
      onEnter: () => {
        setThemeLight();
        enableMatte(true);
        setMatteState({ inset: 28, radius: 22 });
      },
      onEnterBack: () => {
        setThemeLight();
        enableMatte(true);
        setMatteState({ inset: 28, radius: 22 });
      },
      onLeaveBack: () => {
        setThemeDark();
        enableMatte(false);
        setMatteState({ inset: 0, radius: 0 });
      },
      onToggle: (self) => {
        pillarsActive = self.isActive;
        if (self.isActive) {
          if (isPhone()) {
            showHeaderNow();
          } else {
            hideHeaderNow();
          }
        } else {
          matteRoot.style.removeProperty("--logo-color");
        }
      },
    },
  });

  if (pillarsCanvas && window.THREE) {
    renderer = new THREE.WebGLRenderer({ canvas: pillarsCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.4, 6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(4, 6, 5);
    scene.add(key);

    const lensTexture = new THREE.TextureLoader().load("Photos/lens.png");
    lensTexture.colorSpace = THREE.SRGBColorSpace;
    lensTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const lensGeo = new THREE.PlaneGeometry(5.6, 5.6);
    const lensMat = new THREE.MeshStandardMaterial({
      map: lensTexture,
      transparent: true,
      roughness: 0.6,
      metalness: 0.05,
    });

    lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.y = -2.2;
    scene.add(lens);
  }

  const resizePillars = () => {
    updateScale();
    if (renderer && camera) {
      const width = pillarsSection.clientWidth || window.innerWidth;
      const height = pillarsSection.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    ScrollTrigger.refresh();
  };

  window.addEventListener("resize", resizePillars);
  resizePillars();

  const loop = () => {
    smoothProgress += (targetProgress - smoothProgress) * 0.08;
    updateTheme(smoothProgress);

    if (renderer && lens && camera) {
      const stopAt = 2 / 3;
      const exitAt = 0.8;
      const moveT = clampValue(smoothProgress / stopAt, 0, 1);
      const exitT = clampValue((smoothProgress - exitAt) / (1 - exitAt), 0, 1);
      const moving = smoothProgress <= stopAt;
      const exiting = smoothProgress >= exitAt;

      const targetX = moving
        ? lerpValue(-1.6, 1.6, moveT)
        : exiting
          ? lerpValue(1.6, -4.5, exitT)
          : 1.6;

      roll += (targetX - lastX) * -0.9;
      lastX = targetX;
      lens.rotation.set(0, 0, roll);
      lens.position.x = targetX;

      renderer.render(scene, camera);
    }

    requestAnimationFrame(loop);
  };

  loop();
}

const initPillarsDots = () => {
  if (!pillarsSection) return;
  const dotsContainer = pillarsSection.querySelector("[data-dots-container-init]");
  if (!dotsContainer) return;

  let dots = [];
  let dotCenters = [];
  let rafId = null;
  let inside = false;

  const computed = getComputedStyle(pillarsSection);
  const baseColor =
    computed.getPropertyValue("--dots-base").trim() || "rgba(10, 10, 10, 0.12)";
  const activeColor =
    computed.getPropertyValue("--dots-active").trim() || "rgba(10, 10, 10, 0.5)";

  const threshold = 140;
  const threshold2 = threshold * threshold;
  const speedThreshold = 520;
  const maxSpeed = 1600;
  const velSmoothing = 0.22;
  const gapMultiplier = 3.2;
  const centerHoleColFrac = 0;
  const centerHoleRowFrac = 0;

  const shock = {
    pending: false,
    x: 0,
    y: 0,
    radius: 240,
    power: 520,
  };

  const mouse = {
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    speed: 0,
    lastX: -9999,
    lastY: -9999,
    lastT: performance.now(),
  };

  const buildGrid = () => {
    dotsContainer.innerHTML = "";
    dots = [];
    dotCenters = [];

    const dotPx = parseFloat(getComputedStyle(dotsContainer).fontSize) || 9;
    const gap = dotPx * gapMultiplier;
    const cols = Math.floor(dotsContainer.clientWidth / gap);
    const rows = Math.floor(dotsContainer.clientHeight / gap);
    const holeCols = Math.max(1, Math.floor(cols * centerHoleColFrac));
    const holeRows = Math.max(1, Math.floor(rows * centerHoleRowFrac));
    const holeX = Math.floor((cols - holeCols) / 2);
    const holeY = Math.floor((rows - holeRows) / 2);
    const hasHole = centerHoleColFrac > 0 && centerHoleRowFrac > 0;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const inHole =
          hasHole &&
          col >= holeX &&
          col < holeX + holeCols &&
          row >= holeY &&
          row < holeY + holeRows;
        if (inHole) continue;

        const dot = document.createElement("div");
        dot.className = "dot";
        dot.style.margin = `${gap / 2}px`;
        dot._inertiaApplied = false;
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }
    }

    requestAnimationFrame(() => {
      const containerRect = dotsContainer.getBoundingClientRect();
      dotCenters = dots.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          el,
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          setBg: gsap.quickSetter(el, "backgroundColor"),
          hot: false,
          lastT: -1,
        };
      });
    });
  };

  const safeRelease = (el) => {
    el._inertiaApplied = false;
  };

  const pushDot = (el, x, y, resistance) => {
    gsap.killTweensOf(el);
    el._inertiaApplied = true;
    gsap.to(el, {
      inertia: { x, y, resistance },
      overwrite: true,
      onComplete() {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 1.25,
          ease: "elastic.out(1,0.75)",
          overwrite: true,
          onComplete: () => safeRelease(el),
          onInterrupt: () => safeRelease(el),
        });
      },
      onInterrupt() {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "elastic.out(1,0.75)",
          overwrite: true,
          onComplete: () => safeRelease(el),
          onInterrupt: () => safeRelease(el),
        });
      },
    });
  };

  const tick = () => {
    rafId = requestAnimationFrame(tick);

    const containerRect = dotsContainer.getBoundingClientRect();
    const offsetX = containerRect.left;
    const offsetY = containerRect.top;

    if (shock.pending) {
      shock.pending = false;
      const r2 = shock.radius * shock.radius;
      dotCenters.forEach((d) => {
        const dx = offsetX + d.x - shock.x;
        const dy = offsetY + d.y - shock.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > r2) return;
        const dist = Math.sqrt(dist2) || 0.0001;
        const falloff = 1 - dist / shock.radius;
        pushDot(d.el, (dx / dist) * (shock.power * falloff), (dy / dist) * (shock.power * falloff), 980);
      });
    }

    dotCenters.forEach((d) => {
      const dx = offsetX + d.x - mouse.x;
      const dy = offsetY + d.y - mouse.y;
      const dist2 = dx * dx + dy * dy;

      if (dist2 < threshold2) {
        const dist = Math.sqrt(dist2) || 0.0001;
        const t = 1 - dist / threshold;

        if (!d.hot || Math.abs(t - d.lastT) > 0.03) {
          d.hot = true;
          d.lastT = t;
          d.setBg(gsap.utils.interpolate(baseColor, activeColor, t));
        }

        if (mouse.speed > speedThreshold && !d.el._inertiaApplied) {
          const inv = 1 / dist;
          const push = 120;
          const px = dx * inv * push + mouse.vx * 0.0035;
          const py = dy * inv * push + mouse.vy * 0.0035;
          pushDot(d.el, px, py, 1050);
        }
      } else if (d.hot) {
        d.hot = false;
        d.lastT = -1;
        d.setBg(baseColor);
      }
    });
  };

  const clearMouse = () => {
    inside = false;
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.vx = 0;
    mouse.vy = 0;
    mouse.speed = 0;
  };

  const handleMove = (event) => {
    const rect = pillarsSection.getBoundingClientRect();
    inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) {
      clearMouse();
      return;
    }

    const now = performance.now();
    const dt = Math.max(16, now - mouse.lastT);
    const nx = event.clientX;
    const ny = event.clientY;
    let vxRaw = ((nx - mouse.lastX) / dt) * 1000;
    let vyRaw = ((ny - mouse.lastY) / dt) * 1000;
    let sp = Math.hypot(vxRaw, vyRaw);
    if (sp > maxSpeed) {
      const k = maxSpeed / sp;
      vxRaw *= k;
      vyRaw *= k;
    }

    mouse.vx += (vxRaw - mouse.vx) * velSmoothing;
    mouse.vy += (vyRaw - mouse.vy) * velSmoothing;
    mouse.speed = Math.hypot(mouse.vx, mouse.vy);
    mouse.x = nx;
    mouse.y = ny;
    mouse.lastX = nx;
    mouse.lastY = ny;
    mouse.lastT = now;
  };

  const handleClick = (event) => {
    if (!inside) return;
    shock.pending = true;
    shock.x = event.clientX;
    shock.y = event.clientY;
  };

  pillarsSection.addEventListener("mousemove", handleMove, { passive: true });
  pillarsSection.addEventListener("mouseleave", clearMouse, { passive: true });
  pillarsSection.addEventListener("click", handleClick, { passive: true });
  window.addEventListener("resize", buildGrid);

  buildGrid();
  if (rafId) cancelAnimationFrame(rafId);
  tick();
};

initPillarsDots();

const p2Target = document.querySelector("#p2Title");
const p2Slideshow = document.querySelector("#p2Slideshow");
const p2SlideImg = document.querySelector("#p2SlideImg");
const p2Images = [
  "Photos/Architektur_1.jpg",
  "Photos/Architektur_2.jpg",
  "Photos/Architektur_3.jpg",
  "Photos/Architektur_4.jpg",
  "Photos/Architektur_5.jpg",
  "Photos/Architektur_6.jpg",
  "Photos/Architektur_7.jpg",
  "Photos/Architektur_8.jpg",
  "Photos/Architektur_9.jpg",
];

let p2Idx = 0;
let p2Timer = null;
let p2Active = false;
let p2Mouse = { x: 0, y: 0 };
let p2SplitDone = false;
const p2Offset = 16;
const p2Pad = 16;

if (p2Slideshow && p2Slideshow.parentElement !== document.body) {
  document.body.appendChild(p2Slideshow);
}

const positionP2Slideshow = () => {
  if (!p2Slideshow) return;
  const w = p2Slideshow.offsetWidth;
  const h = p2Slideshow.offsetHeight;
  let x = p2Mouse.x + p2Offset;
  let y = p2Mouse.y + p2Offset;
  x = Math.min(x, window.innerWidth - w - p2Pad);
  x = Math.max(p2Pad, x);
  y = Math.min(y, window.innerHeight - h - p2Pad);
  y = Math.max(p2Pad, y);
  p2Slideshow.style.left = `${x}px`;
  p2Slideshow.style.top = `${y}px`;
};

const splitP2Title = () => {
  if (!p2Target || p2SplitDone) return;
  const raw = p2Target.innerHTML.replace(/<br\s*\/?>/gi, " \\n ");
  p2Target.innerHTML = "";
  const parts = raw.split(/\s+/).filter(Boolean);
  let toggle = true;
  parts.forEach((part, index) => {
    if (part === "\\n") {
      p2Target.appendChild(document.createElement("br"));
      return;
    }
    const span = document.createElement("span");
    span.className = toggle ? "front" : "back";
    span.textContent = part;
    p2Target.appendChild(span);
    if (index < parts.length - 1) p2Target.append(" ");
    toggle = !toggle;
  });
  p2SplitDone = true;
};

const p2Show = () => {
  if (!p2Slideshow || !p2SlideImg) return;
  splitP2Title();
  p2Active = true;
  p2Slideshow.style.visibility = "visible";
  p2Slideshow.style.opacity = "1";
  positionP2Slideshow();
  p2SlideImg.src = p2Images[p2Idx];
  p2Idx = (p2Idx + 1) % p2Images.length;
  p2Timer = setInterval(() => {
    p2SlideImg.src = p2Images[p2Idx];
    p2Idx = (p2Idx + 1) % p2Images.length;
  }, 1600);
};

const p2Hide = () => {
  if (!p2Slideshow) return;
  p2Active = false;
  p2Slideshow.style.opacity = "0";
  p2Slideshow.style.visibility = "hidden";
  clearInterval(p2Timer);
  p2Timer = null;
};

if (p2Target) {
  splitP2Title();
  p2Target.addEventListener("mouseenter", p2Show);
  p2Target.addEventListener("mouseleave", p2Hide);
}

window.addEventListener("mousemove", (event) => {
  p2Mouse.x = event.clientX;
  p2Mouse.y = event.clientY;
  if (!p2Active || !p2Slideshow) return;
  positionP2Slideshow();
});

const footer = document.querySelector(".site-footer");
if (footer) {
  ScrollTrigger.create({
    trigger: footer,
    start: "top 80%",
    onEnter: setThemeDark,
    onLeaveBack: setThemeLight,
  });

  ScrollTrigger.create({
    trigger: footer,
    start: "top 85%",
    onEnter: () => {
      enableMatte(true);
      setMatteState({ inset: 28, radius: 30 });
    },
    onEnterBack: () => {
      enableMatte(true);
      setMatteState({ inset: 28, radius: 30 });
    },
  });
}

const aboutItems = gsap.utils.toArray(".about [data-animate]");
if (aboutItems.length) {
  gsap.from(aboutItems, {
    y: 40,
    autoAlpha: 0,
    duration: 0.9,
    ease: "power2.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: ".about",
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
