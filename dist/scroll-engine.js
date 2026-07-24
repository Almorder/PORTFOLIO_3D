/**
 * Nolan Arc - Scroll Engine
 * Système d'animation au scroll utilisant IntersectionObserver et ScrollTimeline
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Détection des préférences de réduction de mouvement
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // 2. Initialisation de l'IntersectionObserver pour les animations de type "reveal"
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                // Optionnel : ne jouer l'animation qu'une fois
                // observer.unobserve(entry.target);
            } else {
                // Pour rejouer l'animation quand on remonte (comportement par défaut actuel)
                entry.target.classList.remove('is-revealed');
            }
        });
    }, observerOptions);

    // Initialiser les éléments avec data-scroll="reveal"
    const revealElements = document.querySelectorAll('[data-scroll="reveal"], [data-scroll="fade-up"], [data-scroll="split-text"]');
    revealElements.forEach(el => {
        revealObserver.observe(el);
        
        // Setup pour split-text
        if (el.dataset.scroll === 'split-text') {
            const text = el.innerText;
            el.innerHTML = '';
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.innerText = char === ' ' ? '\u00A0' : char;
                span.style.transitionDelay = `${i * 0.03}s`;
                el.appendChild(span);
            });
        }
    });

    // 3. Effets Parallax (Fallback JS si CSS ScrollTimeline n'est pas supporté)
    const parallaxElements = document.querySelectorAll('[data-speed]');
    
    // Fonction d'animation de compteurs
    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-scroll="counter"]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // ms
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.ceil(current) + (counter.getAttribute('data-suffix') || '');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target + (counter.getAttribute('data-suffix') || '');
                }
            };
            
            // Observer specifique pour declencher le compteur quand il est visible
            const counterObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    counterObserver.disconnect();
                }
            });
            counterObserver.observe(counter);
        });
    };

    animateCounters();
});
