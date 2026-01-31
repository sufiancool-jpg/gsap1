import { gsap } from "./src/index.js";
import Flip from "./src/Flip.js";
import ScrollTrigger from "./src/ScrollTrigger.js";
import ScrollSmoother from "./src/ScrollSmoother.js";
import ScrollToPlugin from "./src/ScrollToPlugin.js";

gsap.registerPlugin(Flip, ScrollTrigger, ScrollSmoother, ScrollToPlugin);
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
const articlesSection = document.querySelector("#articles");
const articlesLink = document.querySelector('a[href="#articles"]');

const LOCK_CLASS = "scroll-locked";
const ENTERED_CLASS = "is-entered";

let entered = false;
let logoTarget = { x: 0, y: 0, scale: 1 };
let scrollLockY = 0;
let atAbout = false;
let logoIntroDelayTween = null;
let logoIntroTween = null;
let enterTween = null;
let smoother = null;
let aboutScrollTrigger = null;
let aboutStackTimeline = null;
let aboutSlideTween = null;

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
  atAbout = Boolean(on);
  body?.classList.toggle("at-about", atAbout);
  if (!entered || !brand) return;
  gsap.to(brand, {
    autoAlpha: atAbout ? 0 : 1,
    duration: 0.25 * motionFactor,
    ease: "power2.out",
    overwrite: true,
  });
};

const createAboutScrollTriggers = (scroller = window) => {
  if (!aboutSection) return;

  aboutScrollTrigger?.kill();
  aboutStackTimeline?.scrollTrigger?.kill();
  aboutStackTimeline?.kill();

  aboutStackTimeline = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: aboutSection,
      start: "top bottom",
      end: () => `+=${aboutSection.offsetHeight || window.innerHeight}`,
      scrub: 0.9 * motionFactor,
      scroller,
      onToggle: (self) => setAtAbout(self.isActive),
      pin: true,
      pinSpacing: true,
    },
  });

  aboutStackTimeline.fromTo(
    aboutSection,
    { yPercent: 45, opacity: 0.88 },
    { yPercent: 0, opacity: 1 },
    0
  );

  if (stage) {
    aboutStackTimeline.to(stage, { yPercent: -10, scale: 0.98, duration: 1 }, 0);
  }

  aboutScrollTrigger = aboutStackTimeline.scrollTrigger;
};

const initSmoothScroll = () => {
  if (smoother) return smoother;
  const wrapper = document.querySelector("#smooth-wrapper");
  const content = document.querySelector("#smooth-content");
  if (!wrapper || !content) return null;
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.1,
    effects: true,
  });
  createAboutScrollTriggers(smoother.wrapper);
  ScrollTrigger.refresh();
  return smoother;
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

let logoIntroPlayed = false;
const animateLogoIntro = () => {
  if (logoIntroPlayed) return;
  if (!logoWrap || !logoLetters.length) return;
  logoIntroPlayed = true;

  const revealEnterCta = () => {
    if (!enterCta) return;
    gsap.to(enterCta, {
      autoAlpha: 1,
      y: 0,
      delay: 0.2 * motionFactor,
      duration: 0.8 * motionFactor,
      ease: "power3.out",
      overwrite: true,
    });
    gsap.delayedCall(0.3 * motionFactor, pulseCursor);
  };

  logoWrap.classList.add("logo--stack");
  logoWrap.classList.remove("logo--row");

  logoIntroDelayTween = gsap.delayedCall(0.05 * motionFactor, () => {
    if (entered) return;
    revealLogoLetters();
    ensureLogoRow({
      duration: 3.2 * motionFactor,
      onComplete: () => {
        gsap.set(logoWrap, { autoAlpha: 1 });
        computeLogoTarget();
        revealEnterCta();
        gsap.delayedCall(0.4, pulseCursor);
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

const scrollToTarget = (target) => {
  if (!target) return;
  if (smoother) {
    smoother.scrollTo(target, 1.1, "top top");
    return;
  }
  gsap.to(window, {
    scrollTo: { y: target, autoKill: false },
    duration: 1.1,
    ease: "power2.out",
  });
};

const scrollToAbout = () => {
  enterSite({ scrollAfter: true, scrollTarget: aboutSection });
};

const enterSite = ({ scrollAfter = false, scrollTarget = null } = {}) => {
  if (entered) {
    if (scrollAfter) scrollToTarget(scrollTarget || aboutSection);
    return;
  }
  if (enterTween) return;

  const startEnter = () => {
    entered = true;
    body?.classList.add(ENTERED_CLASS);
    revealLogoLetters();

    const introIsActive =
      Boolean(logoIntroDelayTween) || Boolean(logoIntroTween && logoIntroTween.isActive());
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
        initSmoothScroll();
        if (scrollAfter) {
          const target = scrollTarget || aboutSection;
          gsap.delayedCall(0.1 * motionFactor, () => scrollToTarget(target));
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

// Logo intro + CTA reveal
const queueLogoIntro = () => {
  if (logoIntroPlayed) return;
  gsap.delayedCall(0.35, () => {
    requestAnimationFrame(() => requestAnimationFrame(animateLogoIntro));
  });
};
window.addEventListener("load", queueLogoIntro, { once: true });
setTimeout(queueLogoIntro, 1500);

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
  enterSite({ scrollAfter: true });
});

articlesLink?.addEventListener("click", (event) => {
  event.preventDefault();
  enterSite({ scrollAfter: true, scrollTarget: articlesSection });
});

// Keep target updated on resize
window.addEventListener("resize", () => {
  if (!entered) computeLogoTarget();
});

const aboutSlideTrack = document.querySelector(".about-slide-track");
const aboutVariantButtons = Array.from(document.querySelectorAll(".about-variant-button"));
const aboutVariants = [
  {
    key: "vision",
    lead: "We believe that moving images hold a great potential to make architecture truly tangible.",
    paragraphs: [
      "URBANOISE is a production company founded by director/cinematographer Sufian Ararah and photographer and architect Rokas Jankus in 2026, dedicated to architectural documentaries in film and photography.",
      "At the core of our practice lies observation rather than staging. We document processes, uses, transitions and atmospheres as they unfold, allowing architecture to be understood within its real context.",
      "URBANOISE stands for a documentary and artistic engagement with architecture and urban space. Works that aim not at attention, but at understanding.",
    ],
    image: "Photos/us2.JPG",
    alt: "Urbanoise founders portrait",
  },
  {
    key: "practice",
    lead: "Our cameras move with architecture rather than impose a narrative on it.",
    paragraphs: [
      "From research to set design, every shoot is built around how spaces are actually used.",
      "We collaborate with architects, clients, and production partners to choreograph days that respect the material while moving efficiently.",
      "The resulting films and stills stay true to the feel of the place, letting light, texture, and rhythm speak for themselves.",
    ],
    image: "Photos/work4.jpg",
    alt: "Film crew capturing architectural detail",
  },
  {
    key: "process",
    lead: "Every assignment begins with listening to the space and the people inhabiting it.",
    paragraphs: [
      "We document processes, transitions, and atmospheres so architecture can be seen in motion.",
      "Once the first assembly is drafted, we refine pacing, sound, and rhythm until the story feels inevitable.",
      "Long-form films and still photography alike are delivered with practical documentation so teams retain control over the narrative.",
    ],
    image: "Photos/work5.jpg",
    alt: "Architectural space framed by cinematography lighting",
  },
  {
    key: "culture",
    lead: "We balance curiosity with discipline and keep the studio intentionally small.",
    paragraphs: [
      "We travel lightly and stay nimble so we can respond to real-time shifts.",
      "Experimentation is welcomed, but every decision is grounded in craft and focus.",
      "Patience, listening, and a hunger for texture define how we live the work.",
    ],
    image: "Photos/work6.jpg",
    alt: "Urbanoise team working on location",
  },
];

const updateVariantButtons = (activeKey) => {
  aboutVariantButtons.forEach((button) => {
    const isActive = button.dataset.variant === activeKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
};

const setAboutVariant = (variantKey, { animate = true } = {}) => {
  const index = aboutVariants.findIndex((variant) => variant.key === variantKey);
  if (index === -1 || !aboutSlideTrack) return;

  const xPercent = -100 * index;
  updateVariantButtons(variantKey);

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
createAboutScrollTriggers();

if (aboutVariantButtons.length) {
  aboutVariantButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const variantKey = button.dataset.variant;
      if (!variantKey) return;
      setAboutVariant(variantKey);
    });
  });
}
setAboutVariant("vision", { animate: false });
