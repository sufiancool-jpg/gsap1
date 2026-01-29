# P2 Hover Slideshow Backup (2026-01-29)

## HTML (index.html)
```html
<div class="p2-slideshow" id="p2Slideshow" aria-hidden="true">
  <img id="p2SlideImg" alt="">
</div>
```

## CSS (styles.css)
```css
.p2-slideshow {
  position: fixed;
  width: 480px;
  height: auto;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  left: 0;
  top: 0;
  background: #e9e9e9;
  z-index: 6;
}

.p2-slideshow img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.pillars-section .p2-title .front {
  position: relative;
  z-index: 5;
}

.pillars-section .p2-title .back {
  position: relative;
  z-index: 1;
}
```

## JS (main.js)
```js
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
```
