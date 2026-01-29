# P23 Hover Preview Backup (2026-01-29)

## HTML (index.html)
```html
<div class="p23-preview" id="p23Preview" aria-hidden="true">
  <img id="p23PreviewImg" alt="">
</div>
```

## CSS (styles.css)
```css
.pillars-section .p23-preview {
  position: fixed;
  width: min(520px, 72vw);
  overflow: hidden;
  border-radius: 18px;
  background: #111111;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: none;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  left: 0;
  top: 0;
  z-index: 7;
}

.pillars-section .p23-preview img {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  background: #111111;
}
```

## JS (main.js)
```js
const p23Preview = pillarsSection.querySelector("#p23Preview");
const p23PreviewImg = pillarsSection.querySelector("#p23PreviewImg");
let p23Hover = false;
let p23Mouse = { x: 0, y: 0 };
const p23Offset = 24;
const p23Pad = 16;

const updateP23Frame = () => {
  if (!p23Window) return;
  const frame = p23Frames[p23Idx];
  p23Window.style.backgroundImage = `url(${frame})`;
  if (p23Hover && p23PreviewImg) {
    p23PreviewImg.src = frame;
  }
  p23Idx = (p23Idx + 1) % p23Frames.length;
};

const positionP23Preview = () => {
  if (!p23Preview) return;
  const w = p23Preview.offsetWidth;
  const h = p23Preview.offsetHeight;
  let x = p23Mouse.x + p23Offset;
  let y = p23Mouse.y + p23Offset;
  x = Math.min(x, window.innerWidth - w - p23Pad);
  x = Math.max(p23Pad, x);
  y = Math.min(y, window.innerHeight - h - p23Pad);
  y = Math.max(p23Pad, y);
  p23Preview.style.left = `${x}px`;
  p23Preview.style.top = `${y}px`;
};

const showP23Preview = () => {
  if (!p23Preview || !p23PreviewImg) return;
  p23Hover = true;
  const idx = (p23Idx - 1 + p23Frames.length) % p23Frames.length;
  p23PreviewImg.src = p23Frames[idx];
  p23Preview.style.visibility = "visible";
  p23Preview.style.opacity = "1";
  positionP23Preview();
};

const hideP23Preview = () => {
  if (!p23Preview) return;
  p23Hover = false;
  p23Preview.style.opacity = "0";
  p23Preview.style.visibility = "hidden";
};

if (p23Window) {
  p23Window.addEventListener("mouseenter", showP23Preview);
  p23Window.addEventListener("mouseleave", hideP23Preview);
  p23Window.addEventListener("mousemove", (event) => {
    p23Mouse.x = event.clientX;
    p23Mouse.y = event.clientY;
    if (!p23Hover) return;
    positionP23Preview();
  });
}
```
