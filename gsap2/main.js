import { gsap } from "./src/index.js";
import Flip from "./src/Flip.js";

gsap.registerPlugin(Flip);
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

const stageOverlay = document.querySelector(".stage-overlay");
const enterCta = document.querySelector(".enter-cta");

const videoFrame = document.querySelector(".video-frame");
const video = document.querySelector(".hero-video");
const fallback = document.querySelector(".video-fallback");
const scrollBumper = document.querySelector(".scroll-bumper");

const aboutSection = document.querySelector("#about");
const aboutLink = document.querySelector('a[href="#about"]');

const LOCK_CLASS = "scroll-locked";
const ENTERED_CLASS = "is-entered";

let entered = false;
let logoTarget = { x: 0, y: 0, scale: 1 };
let scrollLockY = 0;
let atAbout = false;
let logoIntroDelayTween = null;
let logoIntroTween = null;
let enterTween = null;

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

const scrollToAbout = () => {
  if (!aboutSection) return;
  setAtAbout(true);
  aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
};

const ensureFontsReady = () => {
  if (!document.fonts?.ready) return Promise.resolve();
  if (document.fonts.status === "loaded") return Promise.resolve();
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]);
};

const enterSite = ({ scrollAfter } = {}) => {
  if (entered) {
    if (scrollAfter) scrollToAbout();
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
        if (scrollAfter) {
          gsap.delayedCall(0.1 * motionFactor, scrollToAbout);
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

if (aboutSection && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      setAtAbout(entry.isIntersecting);
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "0px 0px -90% 0px",
    }
  );
  observer.observe(aboutSection);
}

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

// Keep target updated on resize
window.addEventListener("resize", () => {
  if (!entered) computeLogoTarget();
});
