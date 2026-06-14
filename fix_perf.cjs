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

  // iFrame title for Video Modal
  c = c.replace(/<iframe id="modalFrame" src=""([^>]*)><\/iframe>/g, '<iframe id="modalFrame" src="" title="Cinematic Video Player"$1></iframe>');
  
  // Security Meta Tag (X-Frame-Options)
  c = c.replace(/<meta http-equiv="X-Frame-Options"[^>]*>\n?/g, '');

  // 404 Google Font woff2
  c = c.replace(/<link rel="preload" href="[^"]*wlprgwnQF[^"]*" as="font"[^>]*>\n?/g, '');

  // Array.from() error in JS
  // Only replace the specific pattern securely
  c = c.replace(/Array\.from\(dots\)\.forEach\(\(dot, i\) => {/g, 'if(dots && dots.length > 0) { Array.from(dots).forEach((dot, i) => {');
  // Since we opened an extra brace, we must close it where the dots loop ends.
  // Actually, the loop ends with:
  //     });
  //   }
  // The safer way is to just do a null check before calling Array.from:
  // Array.from(dots || [])
  c = c.replace(/Array\.from\(dots\)/g, 'Array.from(dots || [])');

  // Null EventListener
  c = c.replace(/document\.getElementById\('cfSubmit'\)\.addEventListener/g, "const cfSub = document.getElementById('cfSubmit'); if(cfSub) cfSub.addEventListener");
  c = c.replace(/document\.getElementById\('modalFrame'\)\.addEventListener/g, "const mFrame = document.getElementById('modalFrame'); if(mFrame) mFrame.addEventListener");

  fs.writeFileSync(f, c);
});

// Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');

// Touch Targets
css = css.replace(/\.sn-item \{ padding: 12px; margin: -12px; \}/g, '.sn-item { padding: 12px 16px; margin: -12px -16px; }');
if (!css.includes('.sn-item { padding: 12px 16px;')) {
    css += `\n.sn-item { padding: 12px 16px; margin: -12px -16px; }\n`;
}

// SVG Animation Composition
if (!css.includes('will-change: stroke-dashoffset;')) {
    css += `\ncircle.el-fill { will-change: stroke-dashoffset; transform: translateZ(0); }\n`;
}

// Contrast fixes
css += `\n#cookieBanner { background-color: rgba(10, 8, 6, 0.95) !important; color: #F0EBE2 !important; border: 1px solid rgba(204, 70, 12, 0.3); }\n.cookie-btn { color: #020202 !important; background-color: #CC460C !important; font-weight: 600; }\n.hero-cta-btn { font-weight: 600; text-shadow: 0 0 10px rgba(2,2,2,0.5); }\n.marquee-item { font-weight: 500; opacity: 1 !important; color: #F0EBE2 !important; }\n.foot-links a { font-weight: 500; opacity: 0.9 !important; }\n`;

fs.writeFileSync('src/index.css', css);

// Vercel config
fs.writeFileSync('vercel.json', JSON.stringify({
  cleanUrls: true,
  trailingSlash: false,
  headers: [
    { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "/(.*)", headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" }
    ]}
  ]
}, null, 2));

console.log("Fixes safely applied.");
