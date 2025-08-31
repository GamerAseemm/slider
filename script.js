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

    card.addEventListener("click", () => selectCard(i));

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
      if (window.innerWidth < 480) {
      } else {
        card.style.transform = `
        translate(-50%, -50%)
        translate3d(0, 0, 0)
        rotateY(0deg)
        rotateX(0deg)
        scale(1)
      `;
        card.style.opacity = "1";
        card.style.zIndex = "2000";
      }
      card.classList.add("is-preview");
      return;
    }

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

// ====== SNAP TO CARD ======
function snapTo(targetIndex) {
  targetIndex = Math.max(0, Math.min(IMAGES.length - 1, targetIndex));
  if (targetIndex === activeIndex) return;

  const prevIndex = activeIndex;
  const nextIndex = targetIndex;

  const prevCard = stackEl.children[prevIndex];
  const nextCard = stackEl.children[nextIndex];

  // Animate previous card back
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

    updateViewerImage(IMAGES[activeIndex]);

    setTimeout(() => {
      if (prevCard) prevCard.classList.remove("stack-back");
      if (nextCard) nextCard.classList.remove("stack-forward");
    }, 700);
  }, 500);
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

// ====== SELECT CARD (PREVIEW → BACKGROUND) ======
function selectCard(index) {
  const card = stackEl.children[index];

  // Morph card into fullscreen background
  galleryBgImg.src = card.querySelector(".card__img").src;
  galleryBgImg.style.transition = "transform 0.7s cubic-bezier(0.19,1,0.22,1)";
  galleryBgImg.style.transform = "translate(0,0) scale(1)";
  galleryBgImg.style.opacity = "1";

  card.style.transition =
    "opacity 0.5s ease-out, transform 0.7s cubic-bezier(0.19,1,0.22,1)";
  card.style.transform = "translate(-50%, -50%) scale(1.15)";
  card.style.zIndex = 2000;

  setTimeout(() => {
    card.classList.remove("is-preview");
    updateTransforms();
  }, 700);
}

// ====== GALLERY OPEN/CLOSE ======
openGalleryBtn.addEventListener("click", () => {
  document.body.style.overflow = "hidden";
  galleryEl.style.display = "grid";
  void galleryEl.offsetWidth;
  galleryEl.classList.add("is-open");

  // Morph viewer image into active card in stack
  const activeCard = stackEl.children[activeIndex];
  const rect = activeCard.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  galleryBgImg.src = viewerImg.src;
  galleryBgImg.style.transition = "transform 0.7s cubic-bezier(0.19,1,0.22,1)";
  galleryBgImg.style.transform = `
    translate(${rect.left}px, ${rect.top}px)
    scale(${rect.width / vw}, ${rect.height / vh})
  `;
  galleryBgImg.style.opacity = "1";

  updateTransforms();
});

closeGalleryBtn.addEventListener("click", () => {
  galleryEl.classList.remove("is-open");
  setTimeout(() => {
    document.body.style.overflow = "";
  }, 500);
});

// ====== KEYBOARD NAV ======
window.addEventListener("keydown", (e) => {
  if (!galleryEl.classList.contains("is-open")) return;
  if (e.key === "ArrowRight") snapTo(activeIndex + 1);
  if (e.key === "ArrowLeft") snapTo(activeIndex - 1);
  if (e.key === "Enter" || e.key === "Escape")
    galleryEl.classList.remove("is-open");
});

// ====== TOUCH NAV ======
let touchStartX = 0;
let touchStartY = 0;

stackEl.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

stackEl.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
    dx < 0 ? snapTo(activeIndex + 1) : snapTo(activeIndex - 1);
  } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
    dy < 0 ? snapTo(activeIndex + 1) : snapTo(activeIndex - 1);
  }
});

// ====== INIT ======
build();