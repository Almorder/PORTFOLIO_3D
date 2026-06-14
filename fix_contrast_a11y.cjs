const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix aria-hidden-focus
html = html.replace(/<a href="#hero" class="nav-logo" aria-hidden="true">/g, '<a href="#hero" class="nav-logo" aria-hidden="true" tabindex="-1">');
html = html.replace(/<a href="#hero" class="nav-logo" aria-hidden="true" style="([^"]+)">/g, '<a href="#hero" class="nav-logo" aria-hidden="true" tabindex="-1" style="$1">');

// 2. Fix label-content-name-mismatch for side-nav
html = html.replace(/<a class="sn-item active" href="#scroll-top-anchor" data-label="Haut" aria-label="Section navigation">/g, '<a class="sn-item active" href="#scroll-top-anchor" data-label="Haut" aria-label="Aller en Haut">');
html = html.replace(/aria-label="Section navigation"/g, 'aria-label="Navigation vers la section"'); // Fallback for others if any

// 3. Fix main landmark
html = html.replace(/<section id="hero"/, '<main id="hero" role="main"');
html = html.replace(/<\/section>([\s\S]*?)<!-- WORK SECTION -->/, '</main>$1<!-- WORK SECTION -->');

// 4. Fix z-index for hero-glow to fix Contrast ratio
html = html.replace(/<div class="hero-glow parallax-bg" style="position:absolute !important;"/g, '<div class="hero-glow parallax-bg" style="position:absolute !important; z-index:0;"');
html = html.replace(/<div class="hero-glow2 parallax-bg" style="position:absolute !important;"/g, '<div class="hero-glow2 parallax-bg" style="position:absolute !important; z-index:0;"');

fs.writeFileSync('index.html', html);

// 5. Fix color-contrast for Desktop Nav and other links via CSS text-shadow
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('nav a { text-shadow:')) {
    css += `\n/* Accessibility: Ensure text contrast over hero-glow */
nav a, .hero-cta-btn, .foot-email, .foot-copy { text-shadow: 0 2px 10px rgba(0,0,0,0.9); }
.cookie-btn { text-shadow: none; font-weight: 600; }
`;
    fs.writeFileSync('src/index.css', css);
}

console.log('Contrast and A11y fixes applied.');
