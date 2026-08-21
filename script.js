const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");
const packageSelect = document.querySelector("[data-package]");
const pairsInput = document.querySelector("[data-pairs]");
const pairsNote = document.querySelector("[data-pairs-note]");
const finishSelect = document.querySelector("[data-finish]");
const installSelect = document.querySelector("[data-install]");
const estimate = document.querySelector("[data-estimate]");
const estimateField = document.querySelector("[data-estimate-field]");
const form = document.querySelector("[data-quote-form]");
const formMessage = document.querySelector("[data-form-message]");
const galleryCarousels = document.querySelectorAll("[data-gallery-carousel]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrevious = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const heroSequence = document.querySelector("[data-hero-sequence]");
const heroScrollCue = document.querySelector(".hero-scroll-cue");
const heroFrameCount = 84;
const heroDesktopStartFrameIndex = 14;
const heroMobileStartFrameIndex = 14;
const heroMobileFrameSpan = 43;
const heroFrames = [];
const mobileHeroQuery = window.matchMedia("(max-width: 860px)");
let lightboxSlides = [];
let lightboxIndex = 0;
let heroFrameIndex = getHeroInitialFrame();
let heroTargetProgress = 0;
let heroSmoothProgress = 0;
let heroAnimationFrameId = null;
let heroSequenceReady = false;
const heroContext = heroSequence?.getContext("2d");

function setHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function closeMenu() {
  if (!nav || !menuButton) {
    return;
  }

  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

function updateEstimate() {
  if (!packageSelect || !pairsInput || !pairsNote || !finishSelect || !installSelect || !estimate || !estimateField) {
    return;
  }

  const base = Number(packageSelect.value);
  const finish = Number(finishSelect.value);
  const install = Number(installSelect.value);
  const minimumPairs = Number(packageSelect.selectedOptions[0].dataset.minPairs || 1);
  const pairs = Math.max(minimumPairs, Number(pairsInput.value) || minimumPairs);

  pairsInput.min = String(minimumPairs);
  pairsInput.value = String(pairs);
  pairsNote.textContent = minimumPairs === 4
    ? "Team Packs require a minimum of 4 pairs."
    : "Single-pair orders available.";

  const subtotal = (base + finish + install) * pairs;
  estimate.textContent = `£${subtotal.toLocaleString("en-GB")} GBP`;
  estimateField.value = estimate.textContent;
}

function getHeroFramePath(index) {
  return `assets/hero-sequence/${String(index + 1).padStart(4, "0")}.png`;
}

function getHeroInitialFrame() {
  return mobileHeroQuery.matches ? heroMobileStartFrameIndex : heroDesktopStartFrameIndex;
}

function drawHeroFrame(index) {
  if (!heroSequence || !heroContext || !heroSequenceReady) {
    return;
  }

  const frame = heroFrames[index];

  if (!frame) {
    return;
  }

  if (!frame.complete) {
    frame.addEventListener("load", () => drawHeroFrame(index), { once: true });
    return;
  }

  const rect = heroSequence.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const canvasWidth = Math.max(1, Math.round(rect.width * pixelRatio));
  const canvasHeight = Math.max(1, Math.round(rect.height * pixelRatio));

  if (heroSequence.width !== canvasWidth || heroSequence.height !== canvasHeight) {
    heroSequence.width = canvasWidth;
    heroSequence.height = canvasHeight;
  }

  const scale = Math.max(canvasWidth / frame.naturalWidth, canvasHeight / frame.naturalHeight);
  const drawWidth = frame.naturalWidth * scale;
  const drawHeight = frame.naturalHeight * scale;
  const focusOffsetX = mobileHeroQuery.matches ? canvasWidth * -0.04 : 0;
  const drawX = (canvasWidth - drawWidth) / 2 + focusOffsetX;
  const drawY = (canvasHeight - drawHeight) / 2;

  heroContext.clearRect(0, 0, canvasWidth, canvasHeight);
  heroContext.drawImage(frame, drawX, drawY, drawWidth, drawHeight);
}

function getHeroSequenceState() {
  if (!heroSequence || !heroSequenceReady) {
    return null;
  }

  const hero = heroSequence.closest(".hero");

  if (!hero) {
    return null;
  }

  const rect = hero.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const isMobileHero = mobileHeroQuery.matches;
  const scrollRange = isMobileHero ? viewportHeight * 1.55 : Math.max(1, rect.height * 0.92);
  const progress = Math.min(1, Math.max(0, -rect.top / scrollRange));

  return { isMobileHero, progress };
}

function getHeroFrameIndex(progress, isMobileHero) {
  return isMobileHero
    ? (heroMobileStartFrameIndex - Math.round(progress * heroMobileFrameSpan) + heroFrameCount) % heroFrameCount
    : (heroDesktopStartFrameIndex - Math.round(progress * (heroFrameCount - 1)) + heroFrameCount) % heroFrameCount;
}

function renderHeroSequence() {
  const state = getHeroSequenceState();

  if (!state) {
    heroAnimationFrameId = null;
    return;
  }

  const easing = state.isMobileHero ? 0.18 : 0.26;
  const progressDelta = heroTargetProgress - heroSmoothProgress;

  if (Math.abs(progressDelta) < 0.0015) {
    heroSmoothProgress = heroTargetProgress;
  } else {
    heroSmoothProgress += progressDelta * easing;
  }

  const nextIndex = getHeroFrameIndex(heroSmoothProgress, state.isMobileHero);

  if (heroScrollCue) {
    heroScrollCue.style.opacity = state.isMobileHero ? String(Math.max(0, 1 - heroTargetProgress * 4)) : "";
  }

  if (nextIndex !== heroFrameIndex) {
    heroFrameIndex = nextIndex;
    drawHeroFrame(heroFrameIndex);
  }

  if (heroSmoothProgress !== heroTargetProgress) {
    heroAnimationFrameId = window.requestAnimationFrame(renderHeroSequence);
  } else {
    heroAnimationFrameId = null;
  }
}

function updateHeroSequence() {
  const state = getHeroSequenceState();

  if (!state) {
    return;
  }

  heroTargetProgress = state.progress;

  if (!heroAnimationFrameId) {
    heroAnimationFrameId = window.requestAnimationFrame(renderHeroSequence);
  }
}

function initHeroSequence() {
  if (!heroSequence || !heroContext) {
    return;
  }

  for (let index = 0; index < heroFrameCount; index += 1) {
    const frame = new Image();
    frame.src = getHeroFramePath(index);
    heroFrames[index] = frame;

    if (index === 0) {
      frame.addEventListener("load", () => {
        heroSequenceReady = true;
        heroFrameIndex = getHeroInitialFrame();
        heroTargetProgress = 0;
        heroSmoothProgress = 0;
        drawHeroFrame(heroFrameIndex);
        updateHeroSequence();
      }, { once: true });
    }
  }

  window.addEventListener("scroll", updateHeroSequence, { passive: true });
  window.addEventListener("resize", () => {
    drawHeroFrame(heroFrameIndex);
    updateHeroSequence();
  });
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    header.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeMenu();
    }
  });
}

window.addEventListener("scroll", setHeaderState, { passive: true });

if (packageSelect && pairsInput && finishSelect && installSelect) {
  packageSelect.addEventListener("change", updateEstimate);
  pairsInput.addEventListener("input", updateEstimate);
  finishSelect.addEventListener("change", updateEstimate);
  installSelect.addEventListener("change", updateEstimate);
}

if (form && formMessage) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "Sending your request...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Formspree submission failed");
      }

      form.reset();
      updateEstimate();
      formMessage.textContent = "Thanks. Your design proof request has been sent.";
    } catch (error) {
      formMessage.textContent = "Opening secure form submission...";
      form.submit();
    }
  });
}

function showLightboxImage(nextIndex) {
  if (!lightboxImage || !lightboxSlides.length) {
    return;
  }

  lightboxIndex = (nextIndex + lightboxSlides.length) % lightboxSlides.length;
  lightboxImage.src = lightboxSlides[lightboxIndex].src;
  lightboxImage.alt = lightboxSlides[lightboxIndex].alt;
}

function openLightbox(slides, selectedIndex) {
  if (!lightbox) {
    return;
  }

  lightboxSlides = slides;
  showLightboxImage(selectedIndex);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-lightbox");
}

function closeLightbox() {
  if (!lightbox) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-lightbox");
}

galleryCarousels.forEach((carousel) => {
  const slides = [...carousel.querySelectorAll(".gallery-slides img")];
  const previousButton = carousel.querySelector("[data-gallery-prev]");
  const nextButton = carousel.querySelector("[data-gallery-next]");
  let activeIndex = 0;

  if (!slides.length || !previousButton || !nextButton) {
    return;
  }

  function showSlide(nextIndex) {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }

  previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

  slides.forEach((slide, index) => {
    slide.addEventListener("click", () => openLightbox(slides, index));
  });
});

if (lightbox && lightboxClose && lightboxPrevious && lightboxNext) {
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrevious.addEventListener("click", () => showLightboxImage(lightboxIndex - 1));
  lightboxNext.addEventListener("click", () => showLightboxImage(lightboxIndex + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

window.addEventListener("keydown", (event) => {
  if (!lightbox || !lightbox.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
    closeLightbox();
  }

  if (event.key === "ArrowLeft" && lightbox.classList.contains("is-open")) {
    showLightboxImage(lightboxIndex - 1);
  }

  if (event.key === "ArrowRight" && lightbox.classList.contains("is-open")) {
    showLightboxImage(lightboxIndex + 1);
  }
});

initHeroSequence();
setHeaderState();
updateEstimate();
