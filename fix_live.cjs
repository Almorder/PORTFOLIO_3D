const fs = require('fs');

let c = fs.readFileSync('index.html', 'utf8');

// Fix CLS from hero-glow
c = c.replace(/<div class="hero-glow parallax-bg"/g, '<div class="hero-glow parallax-bg" style="position:absolute !important;"');
c = c.replace(/<div class="hero-glow2 parallax-bg"/g, '<div class="hero-glow2 parallax-bg" style="position:absolute !important;"');

// Fix FCP from Google Fonts without swap
c = c.replace(/fonts\.googleapis\.com\/css2\?family=([^&">]+)(?!&display=swap)/g, 'fonts.googleapis.com/css2?family=$1&display=swap');

// Fix Render blocking from Cloudflare Email Decode
c = c.replace(/nolanribcontact@gmail\.com/g, 'nolanribcontact&#64;gmail.com');

fs.writeFileSync('index.html', c);

let css = fs.readFileSync('src/index.css', 'utf8');

// Fix Un-composited Animation
if (!css.includes('will-change: stroke-dashoffset;')) {
    css += `\ncircle.el-fill { will-change: stroke-dashoffset; transform: translateZ(0); }\n`;
}

// Fix CLS from Typewriter
if (!css.includes('.hero-typewriter { min-height')) {
    css += `\n.hero-typewriter { min-height: 3.5em; }\n`;
}
fs.writeFileSync('src/index.css', css);

// Disable Module Preloading in Vite so Three.js isn't pre-downloaded
let vite = fs.readFileSync('vite.config.ts', 'utf8');
if (!vite.includes('modulePreload: false')) {
    vite = vite.replace('build: {', 'build: {\n    modulePreload: false,');
    fs.writeFileSync('vite.config.ts', vite);
}

console.log('Targeted fixes applied.');
