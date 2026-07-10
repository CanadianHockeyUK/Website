const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuButton = document.querySelector("[data-menu-button]");
const packageSelect = document.querySelector("[data-package]");
const pairsInput = document.querySelector("[data-pairs]");
const pairsNote = document.querySelector("[data-pairs-note]");
const finishSelect = document.querySelector("[data-finish]");
const installSelect = document.querySelector("[data-install]");
const estimate = document.querySelector("[data-estimate]");
const form = document.querySelector("[data-quote-form]");
const formMessage = document.querySelector("[data-form-message]");
const galleryCarousels = document.querySelectorAll("[data-gallery-carousel]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrevious = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
let lightboxSlides = [];
let lightboxIndex = 0;

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function closeMenu() {
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

function updateEstimate() {
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
}

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

window.addEventListener("scroll", setHeaderState, { passive: true });
packageSelect.addEventListener("change", updateEstimate);
pairsInput.addEventListener("input", updateEstimate);
finishSelect.addEventListener("change", updateEstimate);
installSelect.addEventListener("change", updateEstimate);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "Thanks. Your design proof request is ready to send.";
});

function showLightboxImage(nextIndex) {
  if (!lightboxSlides.length) {
    return;
  }

  lightboxIndex = (nextIndex + lightboxSlides.length) % lightboxSlides.length;
  lightboxImage.src = lightboxSlides[lightboxIndex].src;
  lightboxImage.alt = lightboxSlides[lightboxIndex].alt;
}

function openLightbox(slides, selectedIndex) {
  lightboxSlides = slides;
  showLightboxImage(selectedIndex);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-lightbox");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-lightbox");
}

galleryCarousels.forEach((carousel) => {
  const slides = [...carousel.querySelectorAll(".gallery-slides img")];
  const previousButton = carousel.querySelector("[data-gallery-prev]");
  const nextButton = carousel.querySelector("[data-gallery-next]");
  let activeIndex = 0;

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

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrevious.addEventListener("click", () => showLightboxImage(lightboxIndex - 1));
lightboxNext.addEventListener("click", () => showLightboxImage(lightboxIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
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

setHeaderState();
updateEstimate();
