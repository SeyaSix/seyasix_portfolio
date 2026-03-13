document.addEventListener('DOMContentLoaded', function () {

    // Glow souris
    const glow = document.getElementById('glow');
    const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
    if (!isTouchDevice()) {
        document.addEventListener('mousemove', e => {
            glow.style.left = e.clientX - 250 + 'px';
            glow.style.top  = e.clientY - 250 + 'px';
        });
    } else {
        glow.style.display = 'none';
    }

    // Scroll snap
    const snapSections = Array.from(document.querySelectorAll('.hero, .section'));
    let currentIndex = 0;
    let isScrolling = false;

    // Navbar
    const navItems = document.querySelectorAll('.nav-item');

    function setActiveNav(sectionId) {
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
        if (active) active.classList.add('active');
    }

    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById(item.dataset.section);
            const idx = snapSections.indexOf(target);
            if (idx !== -1) goToSection(idx);
        });
    });


    const sectionTracker = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                currentIndex = snapSections.indexOf(entry.target);
                if (entry.target.id) setActiveNav(entry.target.id);
            }
        });
    }, { threshold: 0.5 });
    snapSections.forEach(s => sectionTracker.observe(s));

    const footer   = document.querySelector('.site-footer');
    const lastIdx  = snapSections.length - 1;
    let atFooter   = false;

    function goToSection(index) {
        if (index < 0 || index >= snapSections.length || isScrolling) return;
        isScrolling = true;
        atFooter    = false;
        currentIndex = index;
        snapSections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isScrolling = false; }, 900);
    }

    function goToFooter() {
        if (isScrolling) return;
        isScrolling = true;
        atFooter    = true;
        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isScrolling = false; }, 900);
    }

    function scrollDown() {
        if (atFooter) return;
        if (currentIndex < lastIdx) goToSection(currentIndex + 1);
        else goToFooter();
    }

    function scrollUp() {
        if (atFooter) { goToSection(lastIdx); return; }
        goToSection(currentIndex - 1);
    }

    const isMobile = () => window.innerWidth <= 640;

    // Molette
    window.addEventListener('wheel', e => {
        if (isMobile() || modal.classList.contains('show')) return;
        e.preventDefault();
        if (isScrolling) return;
        if (e.deltaY > 0) scrollDown();
        else              scrollUp();
    }, { passive: false });

    // Flèches
    document.addEventListener('keydown', e => {
        if (isMobile() || modal.classList.contains('show')) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); scrollDown(); }
        else if (e.key === 'ArrowUp'  || e.key === 'PageUp')   { e.preventDefault(); scrollUp(); }
    });

    // Tactile
    let touchStartY = 0;
    window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', e => {
        if (isMobile() || modal.classList.contains('show') || isScrolling) return;
        const delta = touchStartY - e.changedTouches[0].clientY;
        if (delta > 50)       scrollDown();
        else if (delta < -50) scrollUp();
    }, { passive: true });

    // Carousel infini
    const carouselWin   = document.querySelector('.carousel-window');
    const carouselTrack = document.querySelector('.carousel-track');
    const prevBtn       = document.querySelector('.carousel-prev');
    const nextBtn_c     = document.querySelector('.carousel-next');
    const VISIBLE       = 3;

    if (carouselTrack && carouselWin) {
        const realCards = Array.from(carouselTrack.querySelectorAll('.card'));
        const n = realCards.length;

        // Track 
        const cloneBefore = realCards[n - 1].cloneNode(true);
        cloneBefore.classList.add('clone', 'visible');
        carouselTrack.prepend(cloneBefore);

        for (let i = 0; i < VISIBLE; i++) {
            const c = realCards[i % n].cloneNode(true);
            c.classList.add('clone', 'visible');
            carouselTrack.append(c);
        }

        
        carouselTrack.querySelectorAll('.clone .skill').forEach(skill => {
            const fill = skill.querySelector('.fill');
            if (fill) fill.style.width = Math.max(0, Math.min(100,
                parseFloat(skill.getAttribute('data-value') || '0'))) + '%';
        });

        let trackIdx    = 1;
        let isCarouselAnimating = false;

        function getVisible() {
            const firstCard = carouselTrack.querySelector('.card');
            if (!firstCard) return VISIBLE;
            return Math.max(1, Math.round(carouselWin.offsetWidth / firstCard.offsetWidth));
        }

        function cardWidth() {
            const firstCard = carouselTrack.querySelector('.card');
            return firstCard ? firstCard.offsetWidth : carouselWin.offsetWidth / VISIBLE;
        }

        function setPos(animated) {
            carouselTrack.style.transition = animated
                ? 'transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                : 'none';
            carouselTrack.style.transform = `translateX(-${trackIdx * cardWidth()}px)`;
        }

        function animateEnter(cardEl) {
            if (!cardEl) return;
            cardEl.style.transition = 'none';
            cardEl.style.opacity   = '0';
            cardEl.style.transform = 'translateY(32px)';
            void cardEl.offsetWidth;
            cardEl.style.transition = 'opacity 0.42s ease, transform 0.42s ease';
            cardEl.style.opacity    = '1';
            cardEl.style.transform  = 'translateY(0)';
            setTimeout(() => {
                cardEl.style.transition = '';
                cardEl.style.opacity    = '';
                cardEl.style.transform  = '';
            }, 450);
        }

        function carouselNext() {
            if (isCarouselAnimating) return;
            isCarouselAnimating = true;
            trackIdx++;
            setPos(true);
            animateEnter(carouselTrack.children[trackIdx + getVisible() - 1]);
        }
        function carouselPrev() {
            if (isCarouselAnimating) return;
            isCarouselAnimating = true;
            trackIdx--;
            setPos(true);
            animateEnter(carouselTrack.children[trackIdx]);
        }

        carouselTrack.addEventListener('transitionend', () => {
            if (trackIdx >= n + 1) { trackIdx -= n; setPos(false); void carouselTrack.offsetWidth; }
            if (trackIdx <= 0)     { trackIdx += n; setPos(false); void carouselTrack.offsetWidth; }
            isCarouselAnimating = false;
        });

        nextBtn_c.addEventListener('click', carouselNext);
        prevBtn.addEventListener('click', carouselPrev);
        window.addEventListener('resize', () => setPos(false));

        setPos(false);
    }

    const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card').forEach(card => cardObserver.observe(card));

    const skills = document.querySelectorAll('.skill');

    const animateBars = () => {
        skills.forEach(skill => {
            const value = parseFloat(skill.getAttribute('data-value') || '0');
            const fill = skill.querySelector('.fill');
            if (fill) requestAnimationFrame(() => {
                fill.style.width = Math.max(0, Math.min(100, value)) + '%';
            });
        });
    };

    const barObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { animateBars(); obs.disconnect(); }
        });
    }, { threshold: 0.2 });
    const firstSection = document.querySelector('.section');
    if (firstSection) barObserver.observe(firstSection);
    else animateBars();

    // Modal images
    const modal       = document.getElementById('imageModal');
    const modalImage  = document.getElementById('modalImage');
    const closeBtn    = document.querySelector('.close');

    document.querySelectorAll('.actions img').forEach(img => {
        img.addEventListener('click', function () {
            modalImage.src = this.src;
            modalImage.alt = this.alt;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });
});
