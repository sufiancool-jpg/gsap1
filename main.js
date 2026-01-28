import { gsap } from "./src/index.js";
import ScrollTrigger from "./src/ScrollTrigger.js";
import ScrollSmoother from "./src/ScrollSmoother.js";
import SplitText from "./src/SplitText.js";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
window.gsap = gsap;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// fullscreenwebgl: set to false to revert to the previous non-WebGL background.
const enableFullscreenWebGL = true;

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
    onEnter: setThemeLight,
    onEnterBack: setThemeLight,
    onLeaveBack: setThemeDark,
  });

  ScrollTrigger.create({
    trigger: aboutSection,
    start: "top 80%",
    onEnter: showHeaderNow,
    onEnterBack: showHeaderNow,
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
    const scale = Math.min(1, window.innerWidth / designW, window.innerHeight / designH);
    const padX = Math.max(0, (window.innerWidth - designW) / 2);
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
  };

  updateTheme(0);

  const getScrollDistance = () => window.innerHeight * 3;
  const getRailShift = () => window.innerWidth * 3;

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
      onToggle: (self) => {
        if (self.isActive) {
          hideHeaderNow();
        } else {
          showHeaderNow();
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
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
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
}

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

const initFullscreenWebGL = () => {
  if (!enableFullscreenWebGL) return;
  const canvas = document.querySelector("#webgl-bg");
  if (!canvas) return;

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!gl) return;

  const useFloat = !!gl.getExtension("EXT_color_buffer_float");
  if (useFloat) {
    gl.getExtension("OES_texture_float_linear");
  }

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const createProgram = (vsSource, fsSource) => {
    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return null;
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  };

  const simVertex = `#version 300 es
    precision highp float;
    out vec2 vUv;
    void main() {
      vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
      vUv = pos * 0.5;
      gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
    }
  `;

  const simFragment = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uState;
    uniform vec2 uTexel;
    uniform vec2 uSplatPos;
    uniform vec2 uSplatDir;
    uniform float uSplatStrength;
    uniform float uSplatRadius;
    uniform float uDamping;
    uniform float uUseFloat;

    vec2 decode(vec2 v) {
      if (uUseFloat < 0.5) {
        return v * 2.0 - 1.0;
      }
      return v;
    }

    vec2 encode(vec2 v) {
      if (uUseFloat < 0.5) {
        return v * 0.5 + 0.5;
      }
      return v;
    }

    void main() {
      vec2 state = decode(texture(uState, vUv).rg);
      float h = state.x;
      float v = state.y;

      float hL = decode(texture(uState, vUv - vec2(uTexel.x, 0.0)).rg).x;
      float hR = decode(texture(uState, vUv + vec2(uTexel.x, 0.0)).rg).x;
      float hU = decode(texture(uState, vUv + vec2(0.0, uTexel.y)).rg).x;
      float hD = decode(texture(uState, vUv - vec2(0.0, uTexel.y)).rg).x;

      float lap = hL + hR + hU + hD - 4.0 * h;
      v += lap * 0.5;
      v *= uDamping;
      h += v;

      vec2 diff = vUv - uSplatPos - uSplatDir;
      float dist = dot(diff, diff);
      float splat = exp(-dist / (uSplatRadius * uSplatRadius));
      h += splat * uSplatStrength;
      v += splat * uSplatStrength * 0.35;

      fragColor = vec4(encode(vec2(h, v)), 0.0, 1.0);
    }
  `;

  const renderVertex = `#version 300 es
    precision highp float;
    uniform sampler2D uHeight;
    uniform vec2 uGrid;
    uniform float uHeightAmp;
    uniform float uPointSize;
    uniform vec2 uRevealPos;
    uniform float uRevealRadius;
    uniform float uRevealSoftness;
    uniform float uTime;
    uniform float uMotionScale;
    uniform float uUseFloat;
    out float vHeight;
    out vec2 vUv;
    out float vReveal;

    void main() {
      float idx = float(gl_VertexID);
      float ix = mod(idx, uGrid.x);
      float iy = floor(idx / uGrid.x);
      vUv = vec2(ix / (uGrid.x - 1.0), iy / (uGrid.y - 1.0));

      vec2 state = texture(uHeight, vUv).rg;
      if (uUseFloat < 0.5) {
        state = state * 2.0 - 1.0;
      }
      float h = state.x;

      vec2 pos = vUv * 2.0 - 1.0;
      float wave1 = sin(vUv.x * 12.0 + uTime * 0.6);
      float wave2 = sin(vUv.y * 9.0 + uTime * 0.4 + vUv.x * 2.0);
      float wave3 = sin((vUv.x + vUv.y) * 7.0 + uTime * 0.7);
      float baseWave = (wave1 * 0.007 + wave2 * 0.006 + wave3 * 0.004) * uMotionScale;
      pos.y += baseWave;
      pos.x += baseWave * 0.18;
      pos.y += h * uHeightAmp;
      gl_Position = vec4(pos, 0.0, 1.0);

      vHeight = h;
      float safeRadius = max(uRevealRadius, 0.0001);
      float dist = distance(vUv, uRevealPos);
      float softness = max(uRevealSoftness, 0.05);
      float reveal = exp(-dist * dist / (safeRadius * safeRadius * softness));
      reveal *= step(0.0001, uRevealRadius);
      vReveal = reveal;

      float size = uPointSize * (1.15 + h * 1.0 + reveal * 0.6);
      gl_PointSize = max(1.0, size);
    }
  `;

  const renderFragment = `#version 300 es
    precision highp float;
    in float vHeight;
    in vec2 vUv;
    in float vReveal;
    uniform vec3 uColor;
    uniform float uVisibility;
    uniform vec2 uRevealPos;
    uniform float uRevealRadius;
    uniform float uRevealSoftness;
    out vec4 fragColor;

    void main() {
      vec2 p = gl_PointCoord - vec2(0.5);
      float d = length(p);
      float core = smoothstep(0.5, 0.0, d);
      float halo = smoothstep(0.5, 0.15, d);

      float vignette = smoothstep(0.95, 0.25, length(vUv - vec2(0.5)));
      float topGlow = exp(-dot(vUv - vec2(0.5, 0.12), vUv - vec2(0.5, 0.12)) * 8.0);
      float heightBoost = 1.0 + vHeight * 0.85;
      float brightness = mix(0.4, 1.25, topGlow);
      brightness *= mix(0.8, 1.35, vReveal);

      vec3 color = uColor * brightness * heightBoost;
      color.r += max(0.0, vHeight) * 0.1;
      color += uColor * halo * 0.1;

      float safeRadius = max(uRevealRadius, 0.0001);
      float dist = distance(vUv, uRevealPos);
      float softness = max(uRevealSoftness, 0.05);
      float reveal = exp(-dist * dist / (safeRadius * safeRadius * softness));
      reveal *= step(0.0001, uRevealRadius);

      float alpha = core * vignette * uVisibility * reveal;
      fragColor = vec4(color, alpha);
    }
  `;

  const simProgram = createProgram(simVertex, simFragment);
  const renderProgram = createProgram(renderVertex, renderFragment);
  if (!simProgram || !renderProgram) return;

  const simUniforms = {
    state: gl.getUniformLocation(simProgram, "uState"),
    texel: gl.getUniformLocation(simProgram, "uTexel"),
    splatPos: gl.getUniformLocation(simProgram, "uSplatPos"),
    splatDir: gl.getUniformLocation(simProgram, "uSplatDir"),
    splatStrength: gl.getUniformLocation(simProgram, "uSplatStrength"),
    splatRadius: gl.getUniformLocation(simProgram, "uSplatRadius"),
    damping: gl.getUniformLocation(simProgram, "uDamping"),
    useFloat: gl.getUniformLocation(simProgram, "uUseFloat"),
  };

  const renderUniforms = {
    height: gl.getUniformLocation(renderProgram, "uHeight"),
    grid: gl.getUniformLocation(renderProgram, "uGrid"),
    heightAmp: gl.getUniformLocation(renderProgram, "uHeightAmp"),
    pointSize: gl.getUniformLocation(renderProgram, "uPointSize"),
    color: gl.getUniformLocation(renderProgram, "uColor"),
    visibility: gl.getUniformLocation(renderProgram, "uVisibility"),
    revealPos: gl.getUniformLocation(renderProgram, "uRevealPos"),
    revealRadius: gl.getUniformLocation(renderProgram, "uRevealRadius"),
    revealSoftness: gl.getUniformLocation(renderProgram, "uRevealSoftness"),
    time: gl.getUniformLocation(renderProgram, "uTime"),
    motionScale: gl.getUniformLocation(renderProgram, "uMotionScale"),
    useFloat: gl.getUniformLocation(renderProgram, "uUseFloat"),
  };

  const quadVao = gl.createVertexArray();
  const pointsVao = gl.createVertexArray();

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;

  const createTexture = (width, height) => {
    const texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const internalFormat = useFloat ? gl.RGBA16F : gl.RGBA8;
    const format = gl.RGBA;
    const type = useFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
    return texture;
  };

  const createFbo = (texture) => {
    const fbo = gl.createFramebuffer();
    if (!fbo || !texture) return null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return fbo;
  };

  let simWidth = 0;
  let simHeight = 0;
  let simA = null;
  let simB = null;
  let fboA = null;
  let fboB = null;
  let current = null;
  let next = null;
  let gridX = 0;
  let gridY = 0;
  let pointCount = 0;

  const rebuildSimulation = (width, height) => {
    simWidth = width;
    simHeight = height;
    simA = createTexture(simWidth, simHeight);
    simB = createTexture(simWidth, simHeight);
    fboA = createFbo(simA);
    fboB = createFbo(simB);
    current = { texture: simA, fbo: fboA };
    next = { texture: simB, fbo: fboB };
  };

  const pointer = {
    active: false,
    inside: false,
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    dirX: 0,
    dirY: 0,
    speed: 0,
    visible: 0,
    revealRadius: 0,
    clickBoost: 0,
    clickTime: 0,
    lastX: 0,
    lastY: 0,
    lastTime: performance.now(),
  };

  const updatePointer = (event) => {
    if (!event.isPrimary) return;
    if (event.target && event.target.closest && event.target.closest(".logo")) {
      pointer.active = false;
      pointer.inside = false;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    pointer.inside = inside;
    pointer.active = inside;
    if (!inside) return;
    pointer.targetX = clamp(x, 0, 1);
    pointer.targetY = clamp(y, 0, 1);

    const now = performance.now();
    const dt = Math.max(16, now - pointer.lastTime);
    const dx = event.clientX - pointer.lastX;
    const dy = event.clientY - pointer.lastY;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    pointer.lastTime = now;
    const distance = Math.hypot(dx, dy);
    const speed = Math.min(distance / dt, 1.6);
    pointer.speed = speed;
    if (distance > 0.001) {
      pointer.dirX = dx / distance;
      pointer.dirY = -dy / distance;
    }
  };

  const clearPointer = () => {
    pointer.active = false;
    pointer.inside = false;
  };

  const releasePointer = () => {
    pointer.active = pointer.inside;
  };

  const triggerClick = (event) => {
    if (!event.isPrimary) return;
    pointer.clickBoost = 1;
    pointer.clickTime = performance.now();
    pointer.speed = Math.max(pointer.speed, 0.6);
    updatePointer(event);
  };

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerdown", triggerClick, { passive: true });
  window.addEventListener("pointerup", releasePointer, { passive: true });
  window.addEventListener("pointerleave", clearPointer, { passive: true });
  window.addEventListener("pointercancel", clearPointer, { passive: true });

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const aspect = width / height;
    gridY = 230;
    gridX = Math.round(gridY * aspect);
    gridX = clamp(gridX, 180, 520);
    pointCount = gridX * gridY;

    const simBase = 256;
    let simW = aspect >= 1 ? Math.round(simBase * aspect) : simBase;
    let simH = aspect >= 1 ? simBase : Math.round(simBase / aspect);
    simW = clamp(simW, 192, 512);
    simH = clamp(simH, 192, 512);
    rebuildSimulation(simW, simH);

    gl.useProgram(renderProgram);
    gl.uniform2f(renderUniforms.grid, gridX, gridY);
    gl.uniform1f(renderUniforms.heightAmp, prefersReducedMotion ? 0.16 : 0.28);
    gl.uniform1f(renderUniforms.pointSize, 5.2 * dpr);
    gl.uniform3f(renderUniforms.color, 0.6, 0.95, 0.9);
    gl.uniform1f(renderUniforms.useFloat, useFloat ? 1 : 0);
    gl.uniform1f(renderUniforms.visibility, 0);
    gl.uniform2f(renderUniforms.revealPos, 0.5, 0.5);
    gl.uniform1f(renderUniforms.revealRadius, 0);
    gl.uniform1f(renderUniforms.revealSoftness, 3.0);
    gl.uniform1f(renderUniforms.time, 0);
    gl.uniform1f(renderUniforms.motionScale, 1);
  };

  gl.disable(gl.CULL_FACE);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.useProgram(simProgram);
  gl.uniform1i(simUniforms.state, 0);
  gl.uniform1f(simUniforms.damping, prefersReducedMotion ? 0.992 : 0.984);
  gl.uniform1f(simUniforms.useFloat, useFloat ? 1 : 0);

  gl.useProgram(renderProgram);
  gl.uniform1i(renderUniforms.height, 0);

  resize();
  window.addEventListener("resize", resize);

  let lastTime = performance.now();
  const baseStrength = 0.004;
  const speedStrength = 0.12;
  const baseRadius = 0.05;
  const revealBase = 0.9;
  const revealBoost = 0.2;
  const idleStrength = 0.0025;
  const idleRadius = 0.05;
  const idleReveal = 1.4;
  const idleVisibility = 0.45;

  const frame = (time) => {
    lastTime = time;

    pointer.x = lerp(pointer.x, pointer.targetX, 0.14);
    pointer.y = lerp(pointer.y, pointer.targetY, 0.14);
    pointer.speed = lerp(pointer.speed, 0, 0.06);
    const t = time * 0.001;
    const idlePulse = 0.55 + 0.45 * (Math.sin(t * 0.55) * 0.5 + 0.5);
    const activePulse = 0.92 + 0.08 * Math.sin(t * 0.6);
    const idleMotion = prefersReducedMotion ? 0 : 1;
    const targetVisibility = pointer.active
      ? 0.95
      : idleVisibility * (0.85 + 0.15 * idlePulse) * idleMotion;
    pointer.visible = lerp(pointer.visible, targetVisibility, 0.07);
    const targetReveal = pointer.active
      ? revealBase + pointer.speed * revealBoost
      : idleReveal * idlePulse * idleMotion;
    pointer.revealRadius = lerp(pointer.revealRadius, targetReveal, 0.08);

    const motionScale = prefersReducedMotion ? 0.35 : 1;
    pointer.clickBoost = lerp(pointer.clickBoost, 0, 0.04);
    const clickPhase = Math.sin(((time - pointer.clickTime) / 1000) * 6.5);
    const clickWave = pointer.active
      ? pointer.clickBoost * (0.6 + 0.4 * clickPhase)
      : 0;

    const strength = pointer.active
      ? (baseStrength + pointer.speed * speedStrength) * motionScale * activePulse + clickWave * 0.08
      : idleStrength * idlePulse * idleMotion;
    const radius = pointer.active
      ? baseRadius + pointer.speed * 0.05 + 0.01 * activePulse + clickWave * 0.18
      : idleRadius;
    const drag = pointer.speed * 0.11;
    const visibility = Math.min(1, pointer.visible);
    const heightAmp =
      (prefersReducedMotion ? 0.12 : 0.2) + pointer.speed * (prefersReducedMotion ? 0.05 : 0.16);
    const renderMotionScale = pointer.active ? 0.4 : 1.0;
    const idleX = 0.5 + Math.cos(t * 0.22) * 0.08;
    const idleY = 0.5 + Math.sin(t * 0.18) * 0.07;

    gl.disable(gl.DEPTH_TEST);
    gl.bindVertexArray(quadVao);
    gl.useProgram(simProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, next.fbo);
    gl.viewport(0, 0, simWidth, simHeight);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.texture);
    gl.uniform2f(simUniforms.texel, 1 / simWidth, 1 / simHeight);
    gl.uniform2f(
      simUniforms.splatPos,
      pointer.active ? pointer.x : idleX,
      pointer.active ? pointer.y : idleY
    );
    gl.uniform2f(simUniforms.splatDir, pointer.dirX * drag, pointer.dirY * drag);
    gl.uniform1f(simUniforms.splatStrength, strength);
    gl.uniform1f(simUniforms.splatRadius, radius);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const temp = current;
    current = next;
    next = temp;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(renderProgram);
    gl.bindVertexArray(pointsVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, current.texture);
    gl.uniform1f(renderUniforms.visibility, visibility);
    gl.uniform2f(
      renderUniforms.revealPos,
      pointer.active ? pointer.x : idleX,
      pointer.active ? pointer.y : idleY
    );
    gl.uniform1f(renderUniforms.revealRadius, pointer.revealRadius);
    gl.uniform1f(renderUniforms.heightAmp, heightAmp);
    gl.uniform1f(renderUniforms.time, time * 0.001);
    gl.uniform1f(renderUniforms.motionScale, renderMotionScale);
    gl.drawArrays(gl.POINTS, 0, pointCount);

    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

initFullscreenWebGL();

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
