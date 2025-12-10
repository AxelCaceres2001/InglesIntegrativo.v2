// Menu Hamburguesa
const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.header__nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navItems = document.querySelectorAll('.header__nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header__content')) {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        }
    });
}

/* Smooth scroll for internal anchors with header offset */
(function(){
    const header = document.querySelector('.header');

    function getHeaderHeight(){
        if (!header) return 0;
        // Use offsetHeight so it includes sticky size
        return header.offsetHeight;
    }

    function scrollToHash(hash, pushState = true){
        if (!hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const id = hash.replace('#','');
        const target = document.getElementById(id);
        if (!target) return;
        const headerH = getHeaderHeight();
        const rect = target.getBoundingClientRect();
        const top = window.pageYOffset + rect.top - headerH - 12; // small offset
        window.scrollTo({ top, behavior: 'smooth' });
        if (pushState) {
            history.pushState(null, '', hash);
        }
    }

    // Attach click handler for internal links
    document.addEventListener('click', function(e){
        const a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        // Only handle same-page anchors (no protocol or host)
        if (href.startsWith('#')){
            e.preventDefault();
            // close mobile nav if open
            const nav = document.querySelector('.header__nav');
            const menuToggle = document.getElementById('menuToggle');
            if (nav && nav.classList.contains('active')){
                nav.classList.remove('active');
            }
            if (menuToggle && menuToggle.classList.contains('active')){
                menuToggle.classList.remove('active');
            }
            scrollToHash(href, true);
        }
    });

    // If page loaded with hash, scroll to it with offset
    window.addEventListener('load', function(){
        if (location.hash) {
            // small timeout to allow layout and header sizes
            setTimeout(() => scrollToHash(location.hash, false), 60);
        }
    });
})();

/* Material ripple effect for elements with .md-btn */
(function(){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function createRipple(e){
        if (prefersReduced) return;
        const el = e.currentTarget;
        // make sure we operate on the element itself
        const rect = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'md-ripple';

        const maxDim = Math.max(rect.width, rect.height);
        const size = Math.round(maxDim * 1.2);
        ripple.style.width = ripple.style.height = size + 'px';

        // If triggered by keyboard, center the ripple
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.type === 'keydown' || (typeof clientX === 'undefined')) {
            clientX = rect.left + rect.width / 2;
            clientY = rect.top + rect.height / 2;
        }

        const left = clientX - rect.left - (size / 2);
        const top = clientY - rect.top - (size / 2);
        ripple.style.left = left + 'px';
        ripple.style.top = top + 'px';

        // initial scale 0, animate to larger and fade out
        el.appendChild(ripple);
        // Force style recalc then animate
        requestAnimationFrame(() => {
            ripple.style.transition = 'transform 600ms cubic-bezier(.4,0,.2,1), opacity 600ms linear';
            ripple.style.transform = 'scale(4)';
            ripple.style.opacity = '0';
        });

        // cleanup
        setTimeout(() => {
            try { ripple.remove(); } catch (err) {}
        }, 700);
    }

    function attachRipples(){
        const buttons = document.querySelectorAll('.md-btn');
        buttons.forEach(btn => {
            // avoid attaching twice
            if (btn.__md_ripple_attached) return;
            btn.addEventListener('click', createRipple);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') createRipple(e);
            });
            btn.__md_ripple_attached = true;
        });
    }

    // attach now and also on DOM changes (in case buttons are added later)
    attachRipples();
    // Re-run on DOMContentLoaded in case script loaded before DOM ready
    document.addEventListener('DOMContentLoaded', attachRipples);
    // optional: observe for added nodes
    const obs = new MutationObserver(() => attachRipples());
    obs.observe(document.body, { childList: true, subtree: true });
})();

// Carrusel de Reseñas
const carouselTrack = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('dotsContainer');

if (carouselTrack) {
    const cards = document.querySelectorAll('.review__card');
    let currentIndex = 0;
    let cardsToShow = 3;

    function updateCardsToShow() {
        if (window.innerWidth <= 600) {
            cardsToShow = 1;
        } else {
            cardsToShow = 3;
        }
    }
    updateCardsToShow();

    function createDots() {
        dotsContainer.innerHTML = '';
        updateCardsToShow();
        const dotCount = Math.max(1, cards.length - cardsToShow + 1);
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('button');
            dot.className = `review__dot ${i === currentIndex ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to review ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function getGap() {
        const style = getComputedStyle(carouselTrack);
        const gap = style.gap || style.columnGap || '0px';
        return parseFloat(gap);
    }


    function getSlideWidth() {
        if (!cards[0]) return 0;
        return cards[0].offsetWidth + getGap();
    }

    function updateCarousel() {
        updateCardsToShow();
        const slideWidth = getSlideWidth();
        const translateX = -(currentIndex * slideWidth);
        carouselTrack.style.transform = `translateX(${translateX}px)`;

        // Actualizar dots
        createDots();
        const dots = dotsContainer.querySelectorAll('.review__dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }


    function goToSlide(index) {
        updateCardsToShow();
        currentIndex = Math.max(0, Math.min(index, cards.length - cardsToShow));
        updateCarousel();
    }

    function nextSlide() {
        updateCardsToShow();
        currentIndex++;
        // Si llegamos al final, vuelve al inicio
        if (currentIndex > cards.length - cardsToShow) {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function prevSlide() {
        updateCardsToShow();
        currentIndex--;
        // Si llegamos al inicio yendo hacia atrás, ve al final
        if (currentIndex < 0) {
            currentIndex = Math.max(0, cards.length - cardsToShow);
        }
        updateCarousel();
    }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Auto-avance (opcional)
    let autoAdvanceInterval;
    
    function startAutoAdvance() {
        stopAutoAdvance();
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoAdvance() {
        if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
    }

    // initialize
    updateCarousel();
    startAutoAdvance();

    // Pausar al pasar el mouse
    carouselTrack.addEventListener('mouseenter', stopAutoAdvance);
    carouselTrack.addEventListener('mouseleave', startAutoAdvance);

    // Pausar en móvil
    carouselTrack.addEventListener('touchstart', stopAutoAdvance);
    carouselTrack.addEventListener('touchend', startAutoAdvance);

    // update on resize to re-center
    window.addEventListener('resize', () => {
        clearTimeout(window.__reviewsResizeTimer);
        window.__reviewsResizeTimer = setTimeout(() => {
            updateCardsToShow();
            // Ajustar el índice si el grupo visible se sale del rango
            if (currentIndex > cards.length - cardsToShow) {
                currentIndex = Math.max(0, cards.length - cardsToShow);
            }
            updateCarousel();
        }, 120);
    });

    // --- DRAG PARA CARRUSEL --- //
    let isDragging = false;
    let startX = 0;
    let dragOffset = 0;


    function startDrag(e) {
        stopAutoAdvance();
        isDragging = true;
        startX = e.clientX;
        dragOffset = 0;
        carouselTrack.style.transition = 'none';
    }

    function onDrag(e) {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        dragOffset = dx;

        const slideWidth = getSlideWidth();
        const baseX = -(currentIndex * slideWidth);
        carouselTrack.style.transform = `translateX(${baseX + dx}px)`;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        carouselTrack.style.transition = '';

        const threshold = 60; // px necesarios para avanzar
        if (dragOffset < -threshold) {
            nextSlide();
        } else if (dragOffset > threshold) {
            prevSlide();
        } else {
            updateCarousel();
        }

        startAutoAdvance();
    }

    // Desktop
    carouselTrack.addEventListener('mousedown', (e) => startDrag(e));
    carouselTrack.addEventListener('mousemove', (e) => onDrag(e));
    carouselTrack.addEventListener('mouseup', endDrag);
    carouselTrack.addEventListener('mouseleave', endDrag);

    // Mobile
    carouselTrack.addEventListener('touchstart', (e) => startDrag(e.touches[0]));
    carouselTrack.addEventListener('touchmove', (e) => onDrag(e.touches[0]));
    carouselTrack.addEventListener('touchend', endDrag);
}
