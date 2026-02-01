import { gsap } from "./src/index.js";
import Flip from "./src/Flip.js";
import ScrollToPlugin from "./src/ScrollToPlugin.js";

gsap.registerPlugin(Flip, ScrollToPlugin);
window.gsap = gsap;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const motionFactor = prefersReducedMotion ? 0.75 : 1;
const phoneMq = window.matchMedia("(max-width: 480px)");

const body = document.body;
const header = document.querySelector(".site-header");
const brand = document.querySelector(".site-brand");

const logo = document.querySelector(".logo");
const logoWrap = logo ? logo.querySelector(".logo-wrap") : null;
const logoLetters = logo ? [...logo.querySelectorAll(".logo-letter")] : [];
const lettersUrb = logo ? [...logo.querySelectorAll(".logo-letter-urb")] : [];
const lettersAno = logo ? [...logo.querySelectorAll(".logo-letter-ano")] : [];
const lettersIse = logo ? [...logo.querySelectorAll(".logo-letter-ise")] : [];
const logoButton = document.querySelector(".logo-button");

const stage = document.querySelector(".stage");
const stageOverlay = document.querySelector(".stage-overlay");
const enterCta = document.querySelector(".enter-cta");

const videoFrame = document.querySelector(".video-frame");
const video = document.querySelector(".hero-video");
const fallback = document.querySelector(".video-fallback");
const scrollBumper = document.querySelector(".scroll-bumper");

const aboutSection = document.querySelector("#about");
const aboutLink = document.querySelector('a[href="#about"]');
const footerBackLink = document.querySelector('a[href="#stage"]');

const LOCK_CLASS = "scroll-locked";
const ENTERED_CLASS = "is-entered";

let entered = false;
let logoTarget = { x: 0, y: 0, scale: 1 };
let scrollLockY = 0;
let logoIntroDelayTween = null;
let logoIntroTween = null;
let enterTween = null;
let aboutSlideTween = null;
let aboutObserver = null;

const lockScroll = () => {
  if (!body) return;
  scrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
  body.classList.add(LOCK_CLASS);
  body.style.position = "fixed";
  body.style.top = `-${scrollLockY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
};

const unlockScroll = () => {
  if (!body) return;
  body.classList.remove(LOCK_CLASS);
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  window.scrollTo(0, scrollLockY);
};

const hideHeaderNow = () => {
  if (!header) return;
  gsap.set(header, { autoAlpha: 0, y: -12 });
};

const showHeaderNow = () => {
  if (!header) return;
  gsap.to(header, {
    autoAlpha: 1,
    y: 0,
    duration: 0.35 * motionFactor,
    ease: "power2.out",
    overwrite: true,
  });
};

const setAtAbout = (on) => {
  const isActive = Boolean(on);
  body?.classList.toggle("at-about", isActive);
  if (!brand) return;
  gsap.to(brand, {
    autoAlpha: isActive ? 0 : 1,
    duration: 0.2 * motionFactor,
    ease: "power2.out",
    overwrite: true,
  });
};

const initAboutObserver = () => {
  if (!aboutSection || !("IntersectionObserver" in window)) return;
  aboutObserver?.disconnect();
  aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target !== aboutSection) return;
        setAtAbout(entry.isIntersecting);
      });
    },
    {
      root: null,
      rootMargin: "-30% 0px -40% 0px",
      threshold: 0.01,
    }
  );
  aboutObserver.observe(aboutSection);
};

const hideBumperNow = () => {
  if (!scrollBumper) return;
  scrollBumper.setAttribute("disabled", "disabled");
  gsap.set(scrollBumper, { autoAlpha: 0, y: 16 });
};

const showBumperNow = () => {
  if (!scrollBumper) return;
  scrollBumper.removeAttribute("disabled");
  gsap.to(scrollBumper, {
    autoAlpha: 1,
    y: 0,
    duration: 0.35 * motionFactor,
    ease: "power2.out",
    overwrite: true,
  });
};

const pulseCursor = () => {
  if (!enterCta) return;
  enterCta.classList.remove("cursor-animate");
  // force reflow to restart animation
  void enterCta.offsetWidth;
  enterCta.classList.add("cursor-animate");
  setTimeout(() => enterCta.classList.remove("cursor-animate"), 1200);
};


const revealLogoLetters = () => {
  if (logoWrap) {
    gsap.fromTo(
      logoWrap,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.7 * motionFactor,
        ease: "power2.out",
        overwrite: true,
      }
    );
  }
};

const computeLogoTarget = () => {
  if (!logo || !brand) return;

  gsap.set(logo, { x: 0, y: 0, scale: 1 });
  brand.style.fontSize = "";
  brand.style.letterSpacing = "";

  const headerY = header ? gsap.getProperty(header, "y") : 0;
  if (header) {
    gsap.set(header, { y: 0 });
  }

  const logoRect = logo.getBoundingClientRect();

  const brandRect = brand.getBoundingClientRect();
  const scale = brandRect.width / logoRect.width;

  const useCenteredTarget = phoneMq.matches;
  const logoCenterX = logoRect.left + logoRect.width / 2;
  const brandCenterX = brandRect.left + brandRect.width / 2;

  logoTarget = {
    x: Math.round(useCenteredTarget ? brandCenterX - logoCenterX : brandRect.left - logoRect.left),
    y: Math.round(brandRect.top - logoRect.top),
    scale: Number(scale.toFixed(4)),
  };

  if (header) {
    gsap.set(header, { y: headerY });
  }
};

const ensureLogoRow = ({ duration = 1.0, onComplete } = {}) => {
  if (!logoWrap || !logoLetters.length) return null;
  logoIntroDelayTween?.kill();
  logoIntroDelayTween = null;
  logoIntroTween?.kill();
  logoIntroTween = null;

  const fromRect = logoWrap.getBoundingClientRect();

  // Measure the final inline size so we can avoid a "snap" when clearing the lock.
  const wasStack = logoWrap.classList.contains("logo--stack");
  logoWrap.classList.remove("logo--stack");
  logoWrap.classList.add("logo--row");
  logoWrap.style.width = "";
  logoWrap.style.height = "";
  const toRect = logoWrap.getBoundingClientRect();
  if (wasStack) {
    logoWrap.classList.add("logo--stack");
  }
  logoWrap.classList.remove("logo--row");

  // Lock the wrapper size during FLIP so centering stays stable while targets go absolute.
  logoWrap.style.width = `${fromRect.width}px`;
  logoWrap.style.height = `${fromRect.height}px`;

  const state = Flip.getState([logoWrap, ...logoLetters]);
  logoWrap.classList.remove("logo--stack");
  logoWrap.classList.add("logo--row");

  logoIntroTween = Flip.from(state, {
    duration,
    ease: "power3.inOut",
    absolute: true,
    nested: true,
    stagger: 0.02,
    onComplete: () => {
      gsap.set(logoLetters, { clearProps: "transform" });
      logoWrap.style.width = `${toRect.width}px`;
      logoWrap.style.height = `${toRect.height}px`;
      requestAnimationFrame(() => {
        logoWrap.style.width = "";
        logoWrap.style.height = "";
      });
      gsap.set(logoWrap, { autoAlpha: 1 });
      onComplete?.();
    },
  });
  return logoIntroTween;
};

const forceLogoRowState = () => {
  if (!logoWrap) return;
  logoIntroDelayTween?.kill();
  logoIntroDelayTween = null;
  logoIntroTween?.kill();
  logoIntroTween = null;
  gsap.set(logoLetters, { clearProps: "transform" });
  logoWrap.classList.remove("logo--stack");
  logoWrap.classList.add("logo--row");
  logoWrap.style.width = "";
  logoWrap.style.height = "";
  gsap.set(logoWrap, { autoAlpha: 1, clearProps: "transform" });
};

let logoIntroPlayed = false;
const animateLogoIntro = () => {
  if (logoIntroPlayed) return;
  if (!logoWrap || !logoLetters.length) return;
  logoIntroPlayed = true;

  const revealEnterCta = () => {
    if (!enterCta) return;
    gsap.fromTo(
      enterCta,
      { autoAlpha: 0, y: 6 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.35 * motionFactor,
        ease: "power2.out",
        overwrite: true,
      }
    );
    gsap.delayedCall(0.2 * motionFactor, pulseCursor);
  };

  logoWrap.classList.add("logo--stack");
  logoWrap.classList.remove("logo--row");

  logoIntroDelayTween = gsap.delayedCall(0.02 * motionFactor, () => {
    if (entered) return;
    revealLogoLetters();
    revealEnterCta();
    ensureLogoRow({
      duration: 1.6 * motionFactor,
      onComplete: () => {
        gsap.set(logoWrap, { autoAlpha: 1 });
        computeLogoTarget();
        gsap.delayedCall(0.25, pulseCursor);
      },
    });
  });
};

const ensureFontsReady = () => {
  if (!document.fonts?.ready) return Promise.resolve();
  if (document.fonts.status === "loaded") return Promise.resolve();
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]);
};

const scrollToTarget = (target, offset = 0) => {
  if (!target) return;
  const y =
    typeof target === "number"
      ? target + offset
      : (target?.offsetTop ?? 0) + offset;
  gsap.to(window, {
    scrollTo: { y, autoKill: false },
    duration: 1.1,
    ease: "power2.out",
  });
};

const scrollToAbout = () => {
  enterSite({ scrollAfter: true, scrollTarget: aboutSection, scrollOffset: 10 });
};

const enterSite = ({ scrollAfter = false, scrollTarget = null, scrollOffset = 0 } = {}) => {
  if (entered) {
    if (scrollAfter) scrollToTarget(scrollTarget || aboutSection, scrollOffset);
    return;
  }
  if (enterTween) return;

  const startEnter = () => {
    const introIsActive =
      Boolean(logoIntroDelayTween) || Boolean(logoIntroTween && logoIntroTween.isActive());
    if (introIsActive) {
      forceLogoRowState();
    }
    entered = true;
    body?.classList.add(ENTERED_CLASS);
    revealLogoLetters();

    const needsRow = logoWrap?.classList.contains("logo--stack") || introIsActive;
    const heroRevealDuration = 1.35 * motionFactor;
    const rowDuration = 0.95 * motionFactor;
    const headerRevealDuration = 0.35 * motionFactor;
    let heroStart = 0;

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        enterTween = null;
        unlockScroll();
        stageOverlay?.setAttribute("aria-hidden", "true");
        showBumperNow();
        if (scrollAfter) {
          const target = scrollTarget || aboutSection;
          const offset = scrollOffset || 0;
          gsap.delayedCall(0.1 * motionFactor, () => scrollToTarget(target, offset));
        }
      },
    });
    enterTween = tl;

    if (enterCta) {
      tl.to(enterCta, { autoAlpha: 0, y: -10, duration: 0.35 * motionFactor }, 0);
    }

    if (needsRow) {
      const rowTween = ensureLogoRow({
        duration: rowDuration,
      });
      if (rowTween) {
        tl.add(rowTween, 0);
        heroStart = rowDuration;
      }
      tl.add(() => computeLogoTarget(), heroStart);
    } else {
      tl.add(() => computeLogoTarget(), 0);
    }

    const headerRevealStart = heroStart + (heroRevealDuration - headerRevealDuration * 1.05);

    if (header) {
      tl.to(
        header,
        {
          autoAlpha: 1,
          y: 0,
          duration: headerRevealDuration,
          ease: "power2.out",
          overwrite: true,
        },
        headerRevealStart
      );
    }

    if (videoFrame) {
      tl.to(
        videoFrame,
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
        heroStart
      );
    }

    if (video) {
      tl.fromTo(
        video,
        { scale: 1.1 },
        { scale: 1, duration: heroRevealDuration, ease: "none" },
        heroStart
      );
    }

    if (logo) {
      tl.to(
        logo,
        {
          x: () => logoTarget.x,
          y: () => logoTarget.y,
          scale: () => logoTarget.scale,
          transformOrigin: () => (phoneMq.matches ? "center top" : "left top"),
          duration: heroRevealDuration,
          ease: "power2.out",
        },
        heroStart
      )
        .set(logo, { autoAlpha: 0 }, heroStart + heroRevealDuration)
        .set(brand, { autoAlpha: 1 }, heroStart + heroRevealDuration);
    }

    if (stageOverlay) {
      tl.to(
        stageOverlay,
        {
          autoAlpha: 0,
          duration: 0.3 * motionFactor,
          ease: "power2.out",
        },
        heroStart + heroRevealDuration - 0.15 * motionFactor
      );
    }
  };

  ensureFontsReady().then(startEnter);
};

// Initial state
window.scrollTo(0, 0);
scrollLockY = 0;
lockScroll();
hideHeaderNow();
hideBumperNow();
gsap.set(brand, { autoAlpha: 0 });
if (logoWrap) {
  gsap.set(logoWrap, { autoAlpha: 0 });
}
  if (enterCta) {
    gsap.set(enterCta, { autoAlpha: 0, y: 16 });
  }
if (videoFrame) {
  gsap.set(videoFrame, {
    yPercent: 120,
    scale: 0.7,
    rotateX: 12,
    rotateY: 0,
    transformOrigin: "center center",
    autoAlpha: 0,
  });
}

if (video && fallback) {
  video.addEventListener("canplay", () => fallback.classList.add("is-hidden"));
}

ensureFontsReady().then(() => computeLogoTarget());
initAboutObserver();

// Logo intro + CTA reveal
const queueLogoIntro = () => {
  if (logoIntroPlayed) return;
  gsap.delayedCall(0.18, () => {
    requestAnimationFrame(() => requestAnimationFrame(animateLogoIntro));
  });
};
window.addEventListener("load", queueLogoIntro, { once: true });
setTimeout(queueLogoIntro, 900);

// Enter interactions
  logoButton?.addEventListener("click", () => {
    enterSite();
  });
logoButton?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    enterSite();
  }
});
enterCta?.addEventListener("click", () => {
  enterSite();
});

// Scroll bumper
scrollBumper?.addEventListener("click", scrollToAbout);

// Header about link
aboutLink?.addEventListener("click", (event) => {
  event.preventDefault();
  enterSite({ scrollAfter: true, scrollOffset: 10 });
});

footerBackLink?.addEventListener("click", (event) => {
  event.preventDefault();
  scrollToTarget(stage || "#stage");
});


// Keep target updated on resize
window.addEventListener("resize", () => {
  if (!entered) computeLogoTarget();
});


const aboutSlideTrack = document.querySelector(".about-slide-track");
const aboutVariantButtons = Array.from(document.querySelectorAll(".about-variant-button"));
const aboutBaseVariant = {
  lead: "We believe that moving images hold a great potential to make architecture truly tangible.",
  paragraphs: [
    "URBANOISE is a production company founded by director/cinematographer Sufian Ararah and photographer and architect Rokas Jankus in 2026, dedicated to architectural documentaries in film and photography.",
    "At the core of our practice lies observation rather than staging. We document processes, uses, transitions and atmospheres as they unfold, allowing architecture to be understood within its real context.",
    "URBANOISE stands for a documentary and artistic engagement with architecture and urban space. Works that aim not at attention, but at understanding.",
  ],
  image: "Photos/us2.JPG",
  alt: "Urbanoise founders portrait",
};

const aboutVariants = ["vision", "practice", "process", "culture"].map((key) => ({
  key,
  ...aboutBaseVariant,
}));

const updateVariantButtons = (activeKey) => {
  aboutVariantButtons.forEach((button) => {
    const isActive = button.dataset.variant === activeKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
};

let aboutActiveIndex = 0;
const setAboutVariant = (index, { animate = true } = {}) => {
  if (!aboutSlideTrack) return;
  const clampedIndex = ((index % aboutVariants.length) + aboutVariants.length) % aboutVariants.length;
  aboutActiveIndex = clampedIndex;

  const xPercent = -100 * clampedIndex;
  updateVariantButtons(aboutVariants[clampedIndex]?.key);

  if (!animate) {
    gsap.set(aboutSlideTrack, { xPercent });
    return;
  }

  if (aboutSlideTween) {
    aboutSlideTween.kill();
  }
  aboutSlideTween = gsap.to(aboutSlideTrack, {
    xPercent,
    duration: 0.75,
    ease: "power2.inOut",
  });
};

const createSlide = (variant) => {
  const slide = document.createElement("article");
  slide.className = "about-slide";
  const paragraphs = variant.paragraphs
    .map((paragraph) => `<p class="about-paragraph">${paragraph}</p>`)
    .join("");
  slide.innerHTML = `
    <div class="about-slide-text">
      <p class="about-eyebrow">About</p>
      <h2 class="about-title">
        We are <span class="about-title-brand">Urbanoise</span>.
      </h2>
      <p class="about-lead">${variant.lead}</p>
      <div class="about-copy">
        ${paragraphs}
      </div>
    </div>
    <div class="about-slide-image">
      <div class="about-photo-wrapper">
        <img class="about-photo" src="${variant.image}" alt="${variant.alt}" loading="lazy" />
      </div>
    </div>
  `;
  return slide;
};

if (aboutSlideTrack) {
  aboutVariants.forEach((variant) => {
    aboutSlideTrack.appendChild(createSlide(variant));
  });
}
if (aboutVariantButtons.length) {
  aboutVariantButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAboutVariant(aboutActiveIndex + 1);
    });
  });
}
setAboutVariant(0, { animate: false });
