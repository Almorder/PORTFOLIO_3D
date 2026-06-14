const fs = require('fs');
const path = require('path');

const walk = d => {
  let res = [];
  try {
    fs.readdirSync(d).forEach(f => {
      let p = path.join(d, f);
      if (fs.statSync(p).isDirectory() && !f.includes('node_modules') && !f.includes('.git') && !f.includes('dist')) {
        res = res.concat(walk(p));
      } else if (f.endsWith('.html')) {
        res.push(p);
      }
    });
  } catch (e) {}
  return res;
};

const htmlFiles = walk('.');

htmlFiles.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');

  // iFrame title for Video Modal (good for A11y)
  c = c.replace(/<iframe id="modalFrame" src=""([^>]*)><\/iframe>/g, '<iframe id="modalFrame" src="" title="Cinematic Video Player"$1></iframe>');
  
  // Security Meta Tag (X-Frame-Options) error removal
  c = c.replace(/<meta http-equiv="X-Frame-Options"[^>]*>\n?/g, '');

  // 404 Google Font woff2 preload removal
  c = c.replace(/<link rel="preload" href="[^"]*wlprgwnQF[^"]*" as="font"[^>]*>\n?/g, '');

  // Cloudflare email decode defer/bypass
  c = c.replace(/nolanribcontact@gmail\.com/g, 'nolanribcontact&#64;gmail.com');

  // Array.from() safely
  c = c.replace(/Array\.from\(dots\)\.forEach\(\(dot, i\) => \{/g, 'if(dots && dots.length > 0) { Array.from(dots).forEach((dot, i) => {');
  c = c.replace(/\}\);\n\s*slider\.addEventListener/g, '});}\n    slider.addEventListener');

  // Null EventListener
  c = c.replace(/document\.getElementById\('cfSubmit'\)\.addEventListener/g, "const cfSub = document.getElementById('cfSubmit'); if(cfSub) cfSub.addEventListener");
  c = c.replace(/document\.getElementById\('modalFrame'\)\.addEventListener/g, "const mFrame = document.getElementById('modalFrame'); if(mFrame) mFrame.addEventListener");

  fs.writeFileSync(f, c);
});

// Update index.css safely
let css = fs.readFileSync('src/index.css', 'utf8');

// Loader animations (Mobile Perf)
css = css.replace(/@keyframes slideDown \{[\s\S]*?\}/, `@keyframes slideDown {
  0% { transform: scaleY(0); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: top; }
}`);
css = css.replace(/@keyframes slideUp \{[\s\S]*?\}/, `@keyframes slideUp {
  0% { transform: scaleY(0); transform-origin: bottom; }
  100% { transform: scaleY(1); transform-origin: bottom; }
}`);

// SVG Animation Composition
if (!css.includes('will-change: stroke-dashoffset;')) {
    css += `\ncircle.el-fill { will-change: stroke-dashoffset; transform: translateZ(0); }\n`;
}
fs.writeFileSync('src/index.css', css);

// Add to inline classes safely
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/transition:height \.9s/g, 'transition:transform .9s');
html = html.replace(/#loader\.cinematic #loader-letterbox-top,#loader\.cinematic #loader-letterbox-bot\{height:12vh;\}/g, '#loader.cinematic #loader-letterbox-top,#loader.cinematic #loader-letterbox-bot{transform:scaleY(1.2);}');
html = html.replace(/#loader\.reveal-ui #loader-letterbox-top,#loader\.reveal-ui #loader-letterbox-bot\{height:0;\}/g, '#loader.reveal-ui #loader-letterbox-top,#loader.reveal-ui #loader-letterbox-bot{transform:scaleY(0);}');
// Fix bottom
html = html.replace(/#loader-letterbox-bot\{bottom:0;\}/g, '#loader-letterbox-bot{bottom:0; transform-origin: bottom;}');
html = html.replace(/#loader-letterbox-top\{top:0;\}/g, '#loader-letterbox-top{top:0; transform-origin: top;}');
fs.writeFileSync('index.html', html);

console.log("Safe Fixes perfectly applied.");
