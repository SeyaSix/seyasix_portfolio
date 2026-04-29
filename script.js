document.addEventListener('DOMContentLoaded', function () {

    // Init EmailJS
    emailjs.init({ publicKey: 'N5qgL5Vk36EiPn92P' });

    // Contact Modal
    const contactModal       = document.getElementById('contactModal');
    const contactCloseBtn    = document.querySelector('.contact-close');
    const contactForm        = document.getElementById('contactForm');
    const contactFeedback    = document.getElementById('contactFeedback');
    const contactSubmitBtn   = document.getElementById('contactSubmitBtn');

    function openContactModal() {
        contactModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        document.getElementById('contact-email').focus();
    }

    function closeContactModal() {
        contactModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        contactForm.reset();
        contactFeedback.textContent = '';
        contactFeedback.className = 'contact-feedback';
        document.querySelectorAll('#contactForm .invalid').forEach(el => el.classList.remove('invalid'));
        contactSubmitBtn.disabled = false;
        contactSubmitBtn.textContent = 'Envoyer';
    }

    contactCloseBtn.addEventListener('click', closeContactModal);
    contactModal.addEventListener('click', e => { if (e.target === contactModal) closeContactModal(); });

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const emailInput   = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message');
        let valid = true;

        [emailInput, messageInput].forEach(el => el.classList.remove('invalid'));

        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            emailInput.classList.add('invalid');
            valid = false;
        }
        if (!messageInput.value.trim()) {
            messageInput.classList.add('invalid');
            valid = false;
        }
        if (!valid) {
            contactFeedback.textContent = 'Veuillez remplir les champs obligatoires correctement.';
            contactFeedback.className = 'contact-feedback error';
            return;
        }

        contactSubmitBtn.disabled = true;
        contactSubmitBtn.textContent = 'Envoi en cours…';
        contactFeedback.textContent = '';
        contactFeedback.className = 'contact-feedback';

        try {
            const templateParams = {
                from_email : document.getElementById('contact-email').value.trim(),
                message    : document.getElementById('contact-message').value.trim(),
                societe    : document.getElementById('contact-company').value.trim() || '',
                phone      : document.getElementById('contact-phone').value.trim() || '',
                name       : document.getElementById('contact-name').value.trim() || '',
            };
            await emailjs.send('service_06igck5', 'template_pyramba', templateParams);
            contactFeedback.textContent = 'Message envoyé avec succès ! Je vous répondrai très vite.';
            contactFeedback.className = 'contact-feedback success';
            contactForm.reset();
            setTimeout(closeContactModal, 3000);
        } catch (err) {
            console.error('EmailJS error:', err);
            contactFeedback.textContent = 'Une erreur est survenue. Veuillez réessayer.';
            contactFeedback.className = 'contact-feedback error';
            contactSubmitBtn.disabled = false;
            contactSubmitBtn.textContent = 'Envoyer';
        }
    });

    // Parachutiste hero-btn
    const parachutistWrap = document.getElementById('parachutist-wrap');
    const heroBtn = document.querySelector('.hero-btn');
    if (heroBtn && parachutistWrap) {
        heroBtn.addEventListener('click', () => {
            if (parachutistWrap.classList.contains('falling')) return;
            parachutistWrap.style.opacity = '1';
            parachutistWrap.classList.add('falling');

            setTimeout(() => {
                openContactModal();

                parachutistWrap.classList.remove('falling');
                parachutistWrap.classList.add('landing');
                setTimeout(() => {
                    parachutistWrap.classList.remove('landing');
                    parachutistWrap.style.opacity = '0';
                }, 320);
            }, 2000);
        });
    }

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

    const isAnyModalOpen = () => modal.classList.contains('show') || contactModal.classList.contains('show');

    // Molette
    window.addEventListener('wheel', e => {
        if (isMobile() || isAnyModalOpen()) return;
        e.preventDefault();
        if (isScrolling) return;
        if (e.deltaY > 0) scrollDown();
        else              scrollUp();
    }, { passive: false });

    // Flèches + fermeture modals au clavier
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (contactModal.classList.contains('show')) { closeContactModal(); return; }
            if (modal.classList.contains('show'))        { closeModal(); return; }
        }
        if (isMobile() || isAnyModalOpen()) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); scrollDown(); }
        else if (e.key === 'ArrowUp'  || e.key === 'PageUp')   { e.preventDefault(); scrollUp(); }
    });

    // Tactile
    let touchStartY = 0;
    window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchend', e => {
        if (isMobile() || isAnyModalOpen() || isScrolling) return;
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

      
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';
        const dots = Array.from({ length: n }, (_, i) => {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dotsContainer.appendChild(dot);
            return dot;
        });
        document.querySelector('.carousel').insertAdjacentElement('afterend', dotsContainer);

        function updateDots() {
            const idx = ((trackIdx - 1) % n + n) % n;
            dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }

        function getVisible() {
            const firstCard = carouselTrack.querySelector('.card');
            if (!firstCard) return VISIBLE;
            return Math.max(1, Math.round(carouselWin.offsetWidth / firstCard.offsetWidth));
        }

        function cardWidth() {
            const firstCard = carouselTrack.querySelector('.card');
            if (!firstCard) return carouselWin.offsetWidth / VISIBLE;
            const gap = parseFloat(getComputedStyle(carouselTrack).gap) || 0;
            return firstCard.offsetWidth + gap;
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
            updateDots();
        }
        function carouselPrev() {
            if (isCarouselAnimating) return;
            isCarouselAnimating = true;
            trackIdx--;
            setPos(true);
            animateEnter(carouselTrack.children[trackIdx]);
            updateDots();
        }

        carouselTrack.addEventListener('transitionend', () => {
            if (trackIdx >= n + 1) { trackIdx -= n; setPos(false); void carouselTrack.offsetWidth; }
            if (trackIdx <= 0)     { trackIdx += n; setPos(false); void carouselTrack.offsetWidth; }
            updateDots();
            isCarouselAnimating = false;
        });

        nextBtn_c.addEventListener('click', carouselNext);
        prevBtn.addEventListener('click', carouselPrev);

     
        let autoInterval = null;
        function startAutoRotate() {
            clearInterval(autoInterval);
            autoInterval = setInterval(carouselNext, 3000);
        }

      
        let cStartX = 0, cStartY = 0;
        carouselWin.addEventListener('touchstart', e => {
            cStartX = e.touches[0].clientX;
            cStartY = e.touches[0].clientY;
        }, { passive: true });
        carouselWin.addEventListener('touchend', e => {
            if (!isMobile()) return;
            const dx = cStartX - e.changedTouches[0].clientX;
            const dy = cStartY - e.changedTouches[0].clientY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                clearInterval(autoInterval);
                if (dx > 0) carouselNext(); else carouselPrev();
                setTimeout(startAutoRotate, 5000);
            }
        }, { passive: true });

        carouselWin.addEventListener('mouseenter', () => clearInterval(autoInterval));
        carouselWin.addEventListener('mouseleave', () => startAutoRotate());

        window.addEventListener('resize', () => { setPos(false); startAutoRotate(); });
        setPos(false);
        startAutoRotate();
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

    document.querySelectorAll('.actions img, .gallery-img').forEach(img => {
        img.addEventListener('click', function () {
            const src = this.getAttribute('src');
            if (!src || !src.trim()) return;
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
});
