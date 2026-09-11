const slideshow = document.getElementById('feature-slideshow');
const slideTrack = slideshow?.querySelector('.slideshow-track');
const slides = slideshow ? [...slideshow.querySelectorAll('.slide')] : [];
const dots = slideshow ? [...slideshow.querySelectorAll('.slide-dot')] : [];
const previousButton = document.getElementById('slide-previous');
const nextButton = document.getElementById('slide-next');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeSlide = 0;
let autoAdvance;
let pointerIdleTimer;

function showSlide(index) {
    if (!slideTrack || slides.length === 0) {
        return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slideTrack.style.transform = `translateX(-${activeSlide * 100}%)`;

    slides.forEach((slide, slideIndex) => {
        slide.setAttribute('aria-hidden', String(slideIndex !== activeSlide));
        slide.tabIndex = slideIndex === activeSlide ? 0 : -1;
    });

    dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeSlide;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
    });
}

function startAutoAdvance() {
    window.clearInterval(autoAdvance);
    if (!reducedMotion.matches) {
        autoAdvance = window.setInterval(() => showSlide(activeSlide + 1), 6000);
    }
}

function pauseAutoAdvance() {
    window.clearInterval(autoAdvance);
}

if (slideshow) {
    previousButton.addEventListener('click', () => {
        showSlide(activeSlide - 1);
        startAutoAdvance();
    });

    nextButton.addEventListener('click', () => {
        showSlide(activeSlide + 1);
        startAutoAdvance();
    });

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            showSlide(dotIndex);
            startAutoAdvance();
        });
    });

    slideshow.addEventListener('mouseenter', pauseAutoAdvance);
    slideshow.addEventListener('mouseleave', startAutoAdvance);
    slideshow.addEventListener('focusin', pauseAutoAdvance);
    slideshow.addEventListener('focusout', (event) => {
        if (!slideshow.contains(event.relatedTarget)) {
            startAutoAdvance();
        }
    });

    slideshow.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            showSlide(activeSlide - 1);
            startAutoAdvance();
        }
        if (event.key === 'ArrowRight') {
            showSlide(activeSlide + 1);
            startAutoAdvance();
        }
    });

    showSlide(0);
    startAutoAdvance();
}

window.addEventListener('pointermove', (event) => {
    document.body.classList.add('pointer-active');
    document.body.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.body.style.setProperty('--cursor-y', `${event.clientY}px`);

    window.clearTimeout(pointerIdleTimer);
    pointerIdleTimer = window.setTimeout(() => {
        document.body.classList.remove('pointer-active');
    }, 1400);
}, { passive: true });

reducedMotion.addEventListener('change', startAutoAdvance);
