// ====== CONFIG ======
const IMAGES = [
  "https://picsum.photos/id/1015/1600/1000",
  "https://picsum.photos/id/1016/1600/1000",
  "https://picsum.photos/id/1018/1600/1000",
  "https://picsum.photos/id/1020/1600/1000",
  "https://picsum.photos/id/1024/1600/1000",
  "https://picsum.photos/id/1027/1600/1000",
];

// ====== ELEMENTS ======
const viewerImg = document.getElementById("viewerImg");
const openGalleryBtn = document.getElementById("openGallery");
const galleryEl = document.getElementById("gallery");
const closeGalleryBtn = document.getElementById("closeGallery");
const stackEl = document.getElementById("stack");
const dotsEl = document.getElementById("dots");

// ====== STATE ======
let activeIndex = 0;

// ====== BUILD UI ======
function build() {
  viewerImg.src = IMAGES[0];

  IMAGES.forEach((src, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;

    const img = document.createElement("img");
    img.className = "card__img";
    img.src = src;
    img.alt = `Image ${i + 1}`;
    card.appendChild(img);

    card.addEventListener("click", () => {
      snapTo(i);
      setTimeout(() => galleryEl.classList.remove("is-open"), 200);
    });

    stackEl.appendChild(card);
  });

  IMAGES.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "dot";
    d.addEventListener("click", () => snapTo(i));
    dotsEl.appendChild(d);
  });

  updateTransforms(true);
}

// ====== TRANSFORMS / LAYOUT ======
function updateTransforms(initial = false) {
  const cards = [...stackEl.children];

  // Update dots
  [...dotsEl.children].forEach((d, i) => {
    d.classList.toggle("is-on", i === activeIndex);
  });

  cards.forEach((card, i) => {
    if (i === activeIndex) {
      // Active (preview) card explicit transform
      card.style.transform = `
        translate(-50%, -50%)
        translate3d(0, 0, 0)
        rotateY(0deg)
        rotateX(0deg)
        scale(1)
      `;
      card.style.opacity = "1";
      card.style.zIndex = "2000";
      card.classList.add("is-preview");
      return;
    }

    // Background stack arrangement
    const offset = i * 6;
    const depth = -i * 40;
    const tilt = -40 + i * 2;

    card.style.transform = `
      translate(-50%, -50%)
      translate3d(${offset}px, ${offset * 0.5}px, ${depth}px)
      rotateY(${tilt}deg)
      rotateX(4deg)
      scale(0.9)
    `;
    card.style.opacity = "0.7";
    card.style.zIndex = String(1000 - i);
    card.classList.remove("is-preview");
  });

  if (initial)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => updateTransforms())
    );
}

function snapTo(targetIndex) {
  targetIndex = Math.max(0, Math.min(IMAGES.length - 1, targetIndex));
  if (targetIndex === activeIndex) return;

  const prevIndex = activeIndex;
  const nextIndex = targetIndex;

  const prevCard = stackEl.children[prevIndex];
  const nextCard = stackEl.children[nextIndex];

  // 1️⃣ Animate previous card back into stack
  if (prevCard) {
    prevCard.classList.remove("is-preview", "stack-forward");
    prevCard.classList.add("stack-back");

    const offset = prevIndex * 6;
    const depth = -prevIndex * 40;
    const tilt = -40 + prevIndex * 2;

    prevCard.style.transform = `
      translate(-50%, -50%)
      translate3d(${offset}px, ${offset * 0.5}px, ${depth}px)
      rotateY(${tilt}deg)
      rotateX(4deg)
      scale(0.9)
    `;
    prevCard.style.opacity = "0.7";
    prevCard.style.zIndex = String(1000 - prevIndex);
  }

  // 2️⃣ After "back" animation finishes, animate next card forward
  setTimeout(() => {
    activeIndex = nextIndex;

    if (nextCard) {
      nextCard.classList.remove("stack-back");
      nextCard.classList.add("stack-forward", "is-preview");

      nextCard.style.transform = `
        translate(-50%, -50%)
        translate3d(0, 0, 0)
        rotateY(0deg)
        rotateX(0deg)
        scale(1)
      `;
      nextCard.style.opacity = "1";
      nextCard.style.zIndex = "2000";
    }

    // Update viewer image
    updateViewerImage(IMAGES[activeIndex]);

    // Clean up transition classes
    setTimeout(() => {
      if (prevCard) prevCard.classList.remove("stack-back");
      if (nextCard) nextCard.classList.remove("stack-forward");
    }, 700);
  }, 500); // match your stack-back transition duration
}

// ====== VIEWER IMAGE TRANSITION ======
function updateViewerImage(src) {
  const oldImg = viewerImg.cloneNode(false);
  oldImg.classList.add("viewer__img-exit");
  viewerImg.parentNode.appendChild(oldImg);

  viewerImg.style.opacity = "0";
  viewerImg.style.transform = "scale(1.1) translateY(20px)";
  viewerImg.src = src;

  requestAnimationFrame(() => {
    oldImg.style.opacity = "0";
    oldImg.style.transform = "scale(0.9) translateY(-20px)";

    setTimeout(() => {
      viewerImg.style.transition =
        "opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)";
      viewerImg.style.opacity = "1";
      viewerImg.style.transform = "scale(1) translateY(0)";

      setTimeout(() => {
        oldImg.remove();
        viewerImg.style.transition = "";
      }, 800);
    }, 150);
  });
}
// ====== INPUT: KEYBOARD ======
window.addEventListener("keydown", (e) => {
  if (!galleryEl.classList.contains("is-open")) return;
  if (e.key === "ArrowRight") snapTo(activeIndex + 1);
  if (e.key === "ArrowLeft") snapTo(activeIndex - 1);
  if (e.key === "Enter" || e.key === "Escape")
    galleryEl.classList.remove("is-open");
});

// ====== GALLERY OPEN/CLOSE ======
openGalleryBtn.addEventListener("click", () => {
  document.body.style.overflow = "hidden";
  galleryEl.style.display = "grid";
  void galleryEl.offsetWidth;
  galleryEl.classList.add("is-open");
  updateTransforms();
});

closeGalleryBtn.addEventListener("click", () => {
  galleryEl.classList.remove("is-open");
  setTimeout(() => {
    document.body.style.overflow = "";
  }, 500);
});

function clearTransition(card) {
  setTimeout(() => {
    card.style.transition = "";
    card.classList.remove("stack-forward", "stack-back");
  }, 800); // match your longest transition
}

let touchStartX = 0;
let touchStartY = 0;

stackEl.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

stackEl.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
    // Horizontal swipe
    if (dx < 0) snapTo(activeIndex + 1);
    else snapTo(activeIndex - 1);
  } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
    // Vertical swipe
    if (dy < 0) snapTo(activeIndex + 1);
    else snapTo(activeIndex - 1);
  }
});

// Init
build();
