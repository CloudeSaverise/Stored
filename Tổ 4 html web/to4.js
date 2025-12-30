document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.slider-wrapper');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const slideDuration = 5000;
    const slidesPerView = 3;
    const slideWidthPercentage = 100 / slidesPerView;

    if (!wrapper) {
        console.warn('Slider wrapper (.slider-wrapper) not found');
        return;
    }

    const originalSlides = Array.from(wrapper.querySelectorAll('.member-slide'));
    const originalsCount = originalSlides.length;
    if (originalsCount === 0) return;

    const clonesBefore = originalSlides.slice(-slidesPerView).map(n => n.cloneNode(true));
    const clonesAfter = originalSlides.slice(0, slidesPerView).map(n => n.cloneNode(true));
    clonesBefore.forEach(n => n.classList.add('clone'));
    clonesAfter.forEach(n => n.classList.add('clone'));
    clonesBefore.forEach(n => wrapper.insertBefore(n, wrapper.firstChild));
    clonesAfter.forEach(n => wrapper.appendChild(n));

    let slides = Array.from(wrapper.querySelectorAll('.member-slide'));
    const totalSlides = slides.length;
    const realCount = totalSlides - 2 * slidesPerView;
    let currentIndex = slidesPerView; 
    let autoSlideInterval = null;
    const storageKey = 'to5-slider-real-index';

    try {
        const saved = parseInt(localStorage.getItem(storageKey), 10);
        if (!Number.isNaN(saved) && saved >= 0 && saved < realCount) {
            currentIndex = slidesPerView + saved;
        }
    } 
    catch (e) {}

    function setTransform(index, withTransition = true) {
        if (withTransition) {
            wrapper.style.transition = 'transform 0.5s ease-in-out';
        } else {
            wrapper.style.transition = 'none';
        }
        const offset = -((index) * slideWidthPercentage) + slideWidthPercentage;
        wrapper.style.transform = `translateX(${offset}%)`;
    }

    function updateActive() {
        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
    }

    function updateSlider(newIndex) {
        currentIndex = newIndex;
        setTransform(currentIndex, true);
        updateActive();
    }

   
    wrapper.addEventListener('transitionend', () => {
        slides = Array.from(wrapper.querySelectorAll('.member-slide'));
        if (currentIndex >= realCount + slidesPerView) {
            wrapper.style.transition = 'none';
            currentIndex = slidesPerView;
            setTransform(currentIndex, false);
            updateActive();
            void wrapper.offsetWidth;
            wrapper.style.transition = 'transform 0.5s ease-in-out';
        } else if (currentIndex < slidesPerView) {
            wrapper.style.transition = 'none';
            currentIndex = realCount + currentIndex;
            setTransform(currentIndex, false);
            updateActive();
            void wrapper.offsetWidth;
            wrapper.style.transition = 'transform 0.5s ease-in-out';
        }
    });

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            updateSlider(currentIndex + 1);
        }, slideDuration);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    setTransform(currentIndex, false);
    updateActive();
    startAutoSlide();

    function saveCurrentRealIndex() {
        try {
            const realIndex = (((currentIndex - slidesPerView) % realCount) + realCount) % realCount;
            localStorage.setItem(storageKey, String(realIndex));
        } 
        catch (e) {}
    }

    wrapper.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a && wrapper.contains(a)) saveCurrentRealIndex();
    });

    window.addEventListener('beforeunload', saveCurrentRealIndex);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveCurrentRealIndex(); });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            updateSlider(currentIndex - 1);
            startAutoSlide();
        });
    } else {
        console.warn('Prev button (.prev-btn) not found');
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            updateSlider(currentIndex + 1);
            startAutoSlide();
        });
    } else {
        console.warn('Next button (.next-btn) not found');
    }

    wrapper.addEventListener('mouseenter', stopAutoSlide);
    wrapper.addEventListener('mouseleave', startAutoSlide);
});