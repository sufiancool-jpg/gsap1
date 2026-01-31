import { gsap } from "./src/index.js";
import ScrollTrigger from "./src/ScrollTrigger.js";
import ScrollSmoother from "./src/ScrollSmoother.js";
import SplitText from "./src/SplitText.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
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
const matteMq = window.matchMedia("(max-width: 768px)");
const phoneMq = window.matchMedia("(max-width: 480px)");
const tabletMq = window.matchMedia("(min-width: 769px) and (max-width: 1024px)");
const laptopMq = window.matchMedia("(min-width: 1025px) and (max-width: 1440px)");
const desktopMq = window.matchMedia("(min-width: 1441px) and (max-width: 1920px)");
const fourKMq = window.matchMedia("(min-width: 1921px)");
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
const isTablet = () => (tabletMq ? tabletMq.matches : false);
const isLaptop = () => (laptopMq ? laptopMq.matches : false);
const isDesktop = () => (desktopMq ? desktopMq.matches : false);
const isFourK = () => (fourKMq ? fourKMq.matches : false);
const isAboutMenuMode = () => isTablet() || isLaptop() || isDesktop() || isFourK();
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
  const useCenteredTarget = isPhone();
  const logoCenterX = logoRect.left + logoRect.width / 2;
  const brandCenterX = brandRect.left + brandRect.width / 2;
  const phoneTargetX = useCenteredTarget ? 0 : null;
  logoTarget = {
    x:
      phoneTargetX !== null
        ? phoneTargetX
        : Math.round(
            useCenteredTarget
              ? brandCenterX - logoCenterX
              : brandRect.left - logoRect.left
          ),
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
      if (!isPhone()) {
        showHeaderNow();
      }
    },
    onEnterBack: () => {
      enableMatte(false);
      setMatteState({ inset: 0, radius: 0 });
      if (!isPhone()) {
        showHeaderNow();
      }
    },
  });
}

const aboutLink = document.querySelector('a[href="#about"]');
const aboutSection = document.querySelector("#about");
const aboutTitle = document.querySelector(".about-title");
const aboutTitleText = aboutTitle ? aboutTitle.textContent : "";
const aboutNavLabel = aboutLink ? aboutLink.querySelector(".btn-label") : null;
const aboutNavText = aboutNavLabel ? aboutNavLabel.textContent : "About us";
let aboutNavIsHome = false;

const setAboutNavState = (nextIsHome) => {
  if (!aboutNavLabel || !aboutLink) return;
  if (!isAboutMenuMode()) {
    aboutNavIsHome = false;
    aboutNavLabel.textContent = aboutNavText;
    return;
  }
  aboutNavIsHome = nextIsHome;
  aboutNavLabel.textContent = nextIsHome ? "Home" : aboutNavText;
};

const setHeaderAboutTone = (on) => {
  if (!header) return;
  const active = on && isAboutMenuMode();
  header.classList.toggle("header-about", active);
  if (active) {
    gsap.fromTo(
      header,
      { backgroundColor: "rgba(8, 44, 56, 0)" },
      {
        backgroundColor: "rgba(8, 44, 56, 0.72)",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      }
    );
  } else {
    gsap.to(header, {
      backgroundColor: "rgba(8, 44, 56, 0)",
      duration: 0.2,
      ease: "power2.out",
      overwrite: "auto",
    });
  }
};

const syncAboutTitle = () => {
  if (!aboutTitle || !aboutTitleText) return;
  aboutTitle.textContent = isTablet() || isPhone()
    ? aboutTitleText.replace(/\.\s*$/, "")
    : aboutTitleText;
};
if (aboutLink && aboutSection) {
  syncAboutTitle();
  window.addEventListener("resize", syncAboutTitle);

  aboutLink.addEventListener("click", (event) => {
    event.preventDefault();
    const targetSelector = aboutNavIsHome ? "#stage" : "#about";
    if (smoother) {
      const target = smoother.offset(targetSelector, "top top");
      gsap.to(smoother, {
        scrollTop: target,
        duration: 1.4,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: ScrollTrigger.update,
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else {
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    }
  });
}

if (aboutSection) {
  ScrollTrigger.create({
    trigger: aboutSection,
    start: () => (isTablet() ? "top 85%" : "top 70%"),
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
      setAboutNavState(true);
      setHeaderAboutTone(true);
    },
    onEnterBack: () => {
      matteRoot.style.removeProperty("--logo-color");
      if (isPhone()) {
        hideHeaderNow();
      } else {
        showHeaderNow();
      }
      setAboutNavState(true);
      setHeaderAboutTone(true);
    },
    onLeave: () => {
      setAboutNavState(false);
      setHeaderAboutTone(false);
    },
    onLeaveBack: () => {
      setAboutNavState(false);
      setHeaderAboutTone(false);
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
      transformOrigin: () => (isPhone() ? "center top" : "left top"),
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
  if (isPhone() || isTablet()) {
    const headerRevealDuration = isTablet() ? 0.6 : 0.25;
    const headerRevealStart = isTablet()
      ? heroRevealDuration - headerRevealDuration
      : heroRevealDuration - 0.35;
    heroTl.to(
      header,
      {
        autoAlpha: 1,
        y: 0,
        duration: headerRevealDuration,
        ease: "power2.out",
      },
      headerRevealStart
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
  const baseLensY = -2.2;
  let lensY = baseLensY;
  let lastX = 0;
  let roll = 0;
  const p23Window = pillarsSection.querySelector("#p23Window");
  const setP23X = p23Window ? gsap.quickSetter(p23Window, "x", "px") : null;
  const setP23Y = p23Window ? gsap.quickSetter(p23Window, "y", "px") : null;
  const setP23Scale = p23Window ? gsap.quickSetter(p23Window, "scale") : null;
  const setP23Alpha = p23Window ? gsap.quickSetter(p23Window, "opacity") : null;
  const p23Wrap = pillarsSection.querySelector(".chapter--p2 .wrap");
  let p23HoverExpand = false;
  const p23ExpandState = { t: 0 };
  const p2Title = p23Wrap ? p23Wrap.querySelector(".p2-title") : null;
  const p2Subcopy = p23Wrap ? p23Wrap.querySelector(".subcopy") : null;
  const p2Kicker = p23Wrap ? p23Wrap.querySelector(".kicker") : null;
  const p2FadeTargets = [p2Kicker, p2Subcopy, p2Title].filter(Boolean);
  let p23Base = null;
  const cacheP23Base = () => {
    if (!p23Window || !p23Wrap || p23HoverExpand) return;
    const rect = p23Window.getBoundingClientRect();
    const styles = window.getComputedStyle(p23Wrap);
    p23Base = {
      w: rect.width,
      h: rect.height,
      padRight: parseFloat(styles.paddingRight) || 0,
      padTop: parseFloat(styles.paddingTop) || 0,
    };
  };
  const applyP23Expand = (expanded) => {
    if (!p23Window || !p23Wrap) return;
    if (!p23Base) cacheP23Base();
    if (!p23Base) return;

    const wrapW = p23Wrap.clientWidth || p23Base.w;
    const wrapH = p23Wrap.clientHeight || p23Base.h;
    const smallScreen = isTablet() || isPhone();
    const mediumScreen = isLaptop() || isDesktop();
    const expandScale = smallScreen ? 1.6 : mediumScreen ? 1.65 : isFourK() ? 2.6 : 2.2;
    const maxW = wrapW * (smallScreen ? 1.0 : mediumScreen ? 1.1 : isFourK() ? 1.35 : 1.2);
    const maxH = wrapH * (smallScreen ? 1.0 : mediumScreen ? 1.1 : isFourK() ? 1.35 : 1.2);
    const targetW = expanded ? Math.min(p23Base.w * expandScale, maxW) : p23Base.w;
    const targetH = expanded ? Math.min(p23Base.h * expandScale, maxH) : p23Base.h;
    const targetPadRight = p23Base.padRight;
    const targetPadTop = p23Base.padTop;
    const duration = expanded ? 0.45 : 0.35;
    const ease = "power2.inOut";

    gsap.to(p23Window, {
      width: targetW,
      height: targetH,
      duration,
      ease,
      overwrite: true,
    });
    gsap.to(p23ExpandState, {
      t: expanded ? 1 : 0,
      duration,
      ease,
      overwrite: true,
    });
    if (p2FadeTargets.length) {
      if (expanded) {
        gsap.to(p2FadeTargets, {
          autoAlpha: 0,
          duration,
          ease,
          overwrite: true,
        });
      } else {
        gsap.to(p2FadeTargets, {
          autoAlpha: 1,
          duration: 0.2,
          ease: "power2.out",
          delay: duration,
          overwrite: true,
        });
      }
    }
  };
  const p1Subcopy = pillarsSection.querySelector(".chapter--p1 .subcopy");
  const defaultP23Frames = [
    "Photos/nyc/feedthegreed.jpg",
    "Photos/nyc/nyc.jpg",
    "Photos/nyc/nyc-01(1).jpg",
    "Photos/nyc/nyc-01.jpg",
    "Photos/nyc/nyc-02(1).jpg",
    "Photos/nyc/nyc-02.jpg",
    "Photos/nyc/nyc-03(1).jpg",
    "Photos/nyc/nyc-03.jpg",
    "Photos/nyc/nyc-05(1).jpg",
    "Photos/nyc/nyc-05.jpg",
    "Photos/nyc/nyc-06(1).jpg",
    "Photos/nyc/nyc-06.jpg",
    "Photos/nyc/nyc-07(1).jpg",
    "Photos/nyc/nyc-07.jpg",
    "Photos/nyc/nyc-08(1).jpg",
    "Photos/nyc/nyc-08.jpg",
    "Photos/nyc/nyc-09(1).jpg",
    "Photos/nyc/nyc-09.jpg",
    "Photos/nyc/nyc-10(1).jpg",
    "Photos/nyc/nyc-10.jpg",
    "Photos/nyc/nyc-11(1).jpg",
    "Photos/nyc/nyc-11.jpg",
    "Photos/nyc/nyc-12(1).jpg",
    "Photos/nyc/nyc-12.jpg",
    "Photos/nyc/nyc-13.jpg",
    "Photos/nyc/nyc-15.jpg",
    "Photos/nyc/nyc-16.jpg",
    "Photos/nyc/nyc-17.jpg",
    "Photos/nyc/nyc-18.jpg",
    "Photos/nyc/nyc-19.jpg",
    "Photos/nyc/nyc-20.jpg",
    "Photos/nyc/RJ387048.jpg",
    "Photos/nyc/RJ388148.jpg",
    "Photos/nyc/RJ388341(1).jpg",
    "Photos/nyc/RJ388341.jpg",
    "Photos/nyc/RJ390300.jpg",
    "Photos/nyc/RJ404959.jpg",
  ];
  let p23Frames = [...defaultP23Frames];
  let p23Idx = 0;
  let p23Timer = null;
  let p23Interval = 0;
  const p23DefaultInterval = 1400;
  const p23HoverInterval = 1800;
  const normalizeP23Frames = (frames) =>
    frames
      .filter(Boolean)
      .map((frame) => {
        if (frame.startsWith("Photos/")) return frame;
        if (frame.startsWith("./Photos/")) return frame.slice(2);
        if (frame.startsWith("nyc/")) return `Photos/${frame}`;
        if (!frame.includes("/")) return `Photos/nyc/${frame}`;
        return frame;
      });
  const applyP23Frames = (frames) => {
    const normalized = normalizeP23Frames(frames);
    if (!normalized.length) return;
    p23Frames = normalized;
    p23Idx = 0;
    setP23Frame(p23Frames[0]);
  };
  const setP23Frame = (frame) => {
    if (!p23Window || !frame) return;
    p23Window.style.backgroundImage = `url("${frame}")`;
  };
  const updateP23Frame = () => {
    if (!p23Window) return;
    if (!p23Frames.length) return;
    const frame = p23Frames[p23Idx];
    setP23Frame(frame);
    p23Idx = (p23Idx + 1) % p23Frames.length;
  };
  const loadP23Frames = async () => {
    try {
      const res = await fetch("Photos/nyc/manifest.json", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const frames = Array.isArray(data) ? data : Array.isArray(data.frames) ? data.frames : [];
      applyP23Frames(frames);
    } catch (_err) {
      // Fallback to default list if manifest is missing or blocked.
    }
  };
  const startP23 = (interval = p23DefaultInterval) => {
    if (!p23Window) return;
    if (prefersReducedMotion) {
      if (p23Frames.length) setP23Frame(p23Frames[0]);
      return;
    }
    if (p23Timer && p23Interval === interval) return;
    stopP23();
    p23Interval = interval;
    updateP23Frame();
    p23Timer = setInterval(updateP23Frame, interval);
  };
  const stopP23 = () => {
    if (!p23Timer) return;
    clearInterval(p23Timer);
    p23Timer = null;
  };

  if (p23Window && p23Wrap) {
    if (p23Frames.length) setP23Frame(p23Frames[0]);
    loadP23Frames();
    p23Window.addEventListener("mouseenter", () => {
      p23HoverExpand = true;
      cacheP23Base();
      applyP23Expand(true);
      startP23(p23HoverInterval);
    });
    p23Window.addEventListener("mouseleave", () => {
      p23HoverExpand = false;
      applyP23Expand(false);
      startP23(p23DefaultInterval);
    });
    window.addEventListener("resize", cacheP23Base);
    cacheP23Base();
  }
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
    Math.max(pillarsSection.clientHeight, pillarsSection.clientWidth) * 4;
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
    lens.position.y = baseLensY;
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

    if (p1Subcopy) {
      pillarsSection.style.setProperty("--p1-subcopy-color", "#000000");
    }

    if (setP23X && setP23Scale && setP23Alpha) {
      const inStart = 0.2;
      const inEnd = 0.34;
      const outStart = 0.5;
      const outEnd = 0.64;
      const inT = clampValue((smoothProgress - inStart) / (inEnd - inStart), 0, 1);
      const outT = clampValue((smoothProgress - outStart) / (outEnd - outStart), 0, 1);
      const easeIn = easeInOut(inT);
      const easeOut = easeInOut(outT);
      const alpha = inT * (1 - outT);
      const x = outT > 0 ? lerpValue(0, -260, easeOut) : lerpValue(220, 0, easeIn);
      const scale = outT > 0 ? lerpValue(1, 0.96, easeOut) : lerpValue(0.94, 1, easeIn);

      setP23X(x);
      if (setP23Y) setP23Y(0);
      setP23Scale(scale);
      setP23Alpha(alpha);

      if (p23HoverExpand && alpha < 0.05) {
        p23HoverExpand = false;
        applyP23Expand(false);
      }

      if (alpha > 0.05) {
        startP23(p23DefaultInterval);
      } else {
        stopP23();
      }
    }

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
      const targetLensY = baseLensY - 0.7 * p23ExpandState.t;
      lensY += (targetLensY - lensY) * 0.12;
      lens.rotation.set(0, 0, roll);
      lens.position.x = targetX;
      lens.position.y = lensY;
      renderer.render(scene, camera);
    }

    requestAnimationFrame(loop);
  };

  loop();
}

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
