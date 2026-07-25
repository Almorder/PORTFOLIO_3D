/**
 * Fluidity.js - Premium perceived performance & preloading system
 * Nolan Arc Portfolio 2026
 */

(function () {
  'use strict';

  // 1. PREDICTIVE PRELOADING
  const preloadedUrls = new Set();

  function prefetch(url) {
    if (!url || preloadedUrls.has(url)) return;
    
    // Avoid prefetching non-internal pages, mailto, anchor or tel links
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:') || url.includes('://') && !url.includes(window.location.hostname)) {
      return;
    }

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      preloadedUrls.add(url);
    } catch (e) {
      console.warn('Prefetch not supported or failed', e);
    }
  }

  // Monitor links entering the viewport
  function initScrollPrefetch() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const href = link.getAttribute('href');
          if (href) prefetch(href);
          observer.unobserve(link);
        }
      });
    }, { rootMargin: '150px' }); // Trigger 150px before entering viewport

    document.querySelectorAll('a[href]').forEach(link => {
      observer.observe(link);
    });
  }

  // Monitor hover or touchstart
  function initHoverPrefetch() {
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href) prefetch(href);
      }
    });

    document.addEventListener('touchstart', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href) prefetch(href);
      }
    }, { passive: true });
  }

  // 2. VISUAL STREAMING (DEFERRED VIDEO LOADING)
  function initVisualStreaming() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all immediately if not supported
      document.querySelectorAll('iframe[data-src]').forEach(iframe => {
        iframe.src = iframe.getAttribute('data-src');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          let iframe = element;
          
          // If it's a wrapper, find child iframe
          if (element.tagName !== 'IFRAME') {
            iframe = element.querySelector('iframe');
          }
          
          if (iframe && iframe.getAttribute('data-src') && !iframe.src) {
            iframe.src = iframe.getAttribute('data-src');
            // Remove backdrop/loading indicators if present
            const loader = element.querySelector('.video-loader');
            if (loader) loader.classList.add('fade-out');
          }
          observer.unobserve(element);
        }
      });
    }, { rootMargin: '200px' });

    // Target either individual iframes or their wrapper containers
    document.querySelectorAll('iframe[data-src]').forEach(iframe => {
      observer.observe(iframe);
    });
    document.querySelectorAll('.video-deferred-container').forEach(container => {
      observer.observe(container);
    });
  }

  // 3. INTERACTIVE TIMECODE STAMP (Signature Visuelle)
  function initTimecodeStamp() {
    const containers = document.querySelectorAll('#project-video, .hero-reel');
    containers.forEach(container => {
      if (container.querySelector('.timecode-stamp')) return;
      
      const stamp = document.createElement('div');
      stamp.className = 'timecode-stamp';
      stamp.style.cssText = `
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        font-family: monospace;
        font-size: 0.58rem;
        letter-spacing: 0.15em;
        color: rgba(240, 235, 226, 0.4);
        background: rgba(5, 4, 3, 0.6);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        pointer-events: none;
        z-index: 10;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      `;
      stamp.textContent = 'STBY [00:00:00:00]';
      container.style.position = 'relative';
      container.appendChild(stamp);

      // Running timecode simulator
      let frames = 0, seconds = 0, minutes = 0, hours = 0;
      setInterval(() => {
        frames += 3; // Simulate 24fps increments at standard intervals
        if (frames >= 24) {
          frames = 0;
          seconds++;
          if (seconds >= 60) {
            seconds = 0;
            minutes++;
            if (minutes >= 60) {
              minutes = 0;
              hours++;
            }
          }
        }
        const pad = (n) => String(n).padStart(2, '0');
        stamp.textContent = `REC [${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}]`;
      }, 125);
    });
  }

  // 4. REVEAL ANIMATIONS (Global fallback for project pages)
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-stagger, .reveal-scale');
    if (!reveals.length || !('IntersectionObserver' in window)) {
      // Fallback: force visibility if no IO
      reveals.forEach(r => r.classList.add('on'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting) {
          e.target.classList.add('on');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(r => io.observe(r));
  }

  // 5. LENIS SMOOTH SCROLLING
  function initLenis() {
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // cinematic easeOutExpo
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      
      // Update reveal elements more smoothly
      lenis.on('scroll', () => {
        // Optionnel: update GSAP ScrollTrigger if used later
      });
    }
  }

  // 6. CUSTOM CURSOR
  function initCustomCursor() {
    if (window.innerWidth <= 992 || typeof gsap === 'undefined') return;
    
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    const text = document.querySelector('.cursor-text');
    if (!dot || !outline) return;

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const speed = 0.2; // outline delay

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      gsap.to(dot, { x: mouse.x, y: mouse.y, duration: 0.1, ease: 'power2.out' });
    });

    const render = () => {
      pos.x += (mouse.x - pos.x) * speed;
      pos.y += (mouse.y - pos.y) * speed;
      gsap.set(outline, { x: pos.x, y: pos.y });
      gsap.set(text, { x: pos.x, y: pos.y });
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    // Hover effects on links/buttons
    const hoverTargets = document.querySelectorAll('a, button, .work-item, .segment-card');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const isPlay = el.classList.contains('work-item');
        gsap.to(outline, { scale: isPlay ? 2 : 1.5, borderColor: isPlay ? '#CC460C' : 'rgba(255,255,255,0.8)', duration: 0.3 });
        gsap.to(dot, { opacity: 0, duration: 0.2 });
        if (isPlay) gsap.to(text, { opacity: 1, duration: 0.3 }); const vid = el.querySelector('.work-hover-video'); if(vid) { vid.play().catch(e=>{}); vid.style.opacity = 1; }
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(outline, { scale: 1, borderColor: 'rgba(255,255,255,0.4)', duration: 0.3 });
        gsap.to(dot, { opacity: 1, duration: 0.2 });
        gsap.to(text, { opacity: 0, duration: 0.3 }); const vid = el.querySelector('.work-hover-video'); if(vid) { vid.pause(); vid.style.opacity = 0; }
      });
    });
  }

  // 7. MAGNETIC BUTTONS
  function initMagneticButtons() {
    if (window.innerWidth <= 992 || typeof gsap === 'undefined') return;
    
    const magnets = document.querySelectorAll('.hero-cta-btn, .cl-cta, .rdv-btn, .insta-cta');
    magnets.forEach(magnet => {
      magnet.addEventListener('mousemove', (e) => {
        const position = magnet.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        
        gsap.to(magnet, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power3.out'
        });
      });
      
      magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }

  // 8. SHOWREEL MODAL
  window.openShowreel = function() {
    const modal = document.getElementById('showreelModal');
    const container = modal.querySelector('.video-container');
    // Inject iframe on demand
    container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/GbeOQ-hgrtU?autoplay=1&mute=0&controls=1&showinfo=0&rel=0&modestbranding=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>`;
    
    modal.style.display = 'flex';
    // Small delay to allow display:flex to apply before animating opacity
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
    
    if (typeof lenis !== 'undefined') lenis.stop();
  };

  window.closeShowreel = function() {
    const modal = document.getElementById('showreelModal');
    const container = modal.querySelector('.video-container');
    modal.style.opacity = '0';
    
    setTimeout(() => {
      modal.style.display = 'none';
      container.innerHTML = ''; // Destroy iframe to stop audio
      if (typeof lenis !== 'undefined') lenis.start();
    }, 500);
  };

  // 9. MOOD FILTERS
  function initMoodFilters() {
    const buttons = document.querySelectorAll('.mood-btn');
    const projects = document.querySelectorAll('.work-item');
    if (!buttons.length || !projects.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Active state
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mood = btn.getAttribute('data-mood');

        projects.forEach(proj => {
          // If "all" or matching mood, reset opacity and scale
          if (mood === 'all' || proj.getAttribute('data-mood') === mood || !proj.getAttribute('data-mood')) {
            gsap.to(proj, { opacity: 1, scale: 1, filter: 'grayscale(0%)', duration: 0.5, ease: 'power2.out' });
            proj.style.pointerEvents = 'auto';
          } else {
            // Dim non-matching projects
            gsap.to(proj, { opacity: 0.15, scale: 0.95, filter: 'grayscale(100%)', duration: 0.5, ease: 'power2.out' });
            proj.style.pointerEvents = 'none';
          }
        });
      });
    });
  }

  // Initialize all features on DOMContentLoaded
  function init() {
    initScrollPrefetch();
    initHoverPrefetch();
    initVisualStreaming();
    initRevealAnimations();
    // initTimecodeStamp();
    initLenis();
    initCustomCursor();
    initMagneticButtons();
    initMoodFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

