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
    const containers = document.querySelectorAll('#project-video, .hero-reel, .work-item');
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

  // Initialize all features on DOMContentLoaded
  function init() {
    initScrollPrefetch();
    initHoverPrefetch();
    initVisualStreaming();
    initTimecodeStamp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
