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

  // Fix react-3d-root layout bug
  c = c.replace(/<div id="react-3d-root" aria-hidden="true"><\/div>/g, '<div id="react-3d-root" aria-hidden="true" style="position:fixed;inset:0;width:100vw;height:100vh;z-index:-10;pointer-events:none;"></div>');
  c = c.replace(/<div id="react-3d-root"><\/div>/g, '<div id="react-3d-root" aria-hidden="true" style="position:fixed;inset:0;width:100vw;height:100vh;z-index:-10;pointer-events:none;"></div>');

  // Isolate Calendly
  c = c.replace(/<iframe title="Calendly prise de rendez-vous"([^>]*)src="https:\/\/calendly\.com([^"]*)"([^>]*)><\/iframe>/gi, '<iframe title="Calendly prise de rendez-vous"$1data-src="https://calendly.com$2"$3></iframe>');
  
  // Lazy load GTM
  c = c.replace(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-EBFDQNBW60"><\/script>\s*<script>\s*window\.dataLayer=window\.dataLayer\|\|\[\];\s*function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*gtag\('js',new Date\(\)\);\s*gtag\('config','G-EBFDQNBW60'\);\s*<\/script>/gs, `
  <script>
    window.addEventListener('scroll', function initGTM() {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-EBFDQNBW60';
      script.async = true;
      document.head.appendChild(script);
      window.dataLayer=window.dataLayer||[];
      function gtag(){dataLayer.push(arguments);}
      gtag('js',new Date());
      gtag('config','G-EBFDQNBW60');
      window.removeEventListener('scroll', initGTM);
    }, {once: true, passive: true});
  </script>
  `);

  // Cloudflare Email Obfuscation fix (to avoid email-decode.min.js)
  c = c.replace(/nolanribcontact@gmail\.com/g, 'nolanribcontact&#64;gmail.com');

  // Add Security Headers
  if (!c.includes('Content-Security-Policy')) {
    c = c.replace(/<head>/, `<head>\n<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">\n<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">\n<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">`);
  }

  // Preconnect google fonts
  if (c.includes('fonts.googleapis.com') && !c.includes('fonts.gstatic.com')) {
    c = c.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/, `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`);
  }

  // JS TypeErrors: Array.from(dots)
  c = c.replace(/dots\.forEach\(/g, 'Array.from(dots).forEach(');
  
  // JS TypeErrors: null checks
  c = c.replace(/document\.getElementById\('cfSubmit'\)\.addEventListener/g, "const cfBtn = document.getElementById('cfSubmit'); if(cfBtn) cfBtn.addEventListener");
  c = c.replace(/document\.getElementById\('modalFrame'\)\.addEventListener/g, "const mf = document.getElementById('modalFrame'); if(mf) mf.addEventListener");

  // Fix YouTube placeholder 404
  c = c.replace(/YOUTUBE_ID_ICI\/maxresdefault\.jpg/g, 'GbeOQ-hgrtU/maxresdefault.jpg');
  
  // Fix aria-labels and duplicate links
  c = c.replace(/<a href="#hero" class="nav-logo"/g, '<a href="#hero" class="nav-logo" aria-hidden="true"');
  // First logo is in the nav, second is in footer. Let's just fix sn-item
  c = c.replace(/<a([^>]*)class="sn-item([^"]*)"([^>]*)>/g, (match, p1, p2, p3) => {
      if (match.includes('aria-label')) return match;
      return `<a${p1}class="sn-item${p2}"${p3} aria-label="Section navigation">`;
  });

  fs.writeFileSync(f, c);
});

// Update script in index.html for Calendly tab
let idxHtml = fs.readFileSync('index.html', 'utf8');
idxHtml = idxHtml.replace(/function switchContactTab\(tabId, btn\) \{/g, `function switchContactTab(tabId, btn) {
    if (tabId === 'calendly-tab') {
      const iframe = document.querySelector('#calendly-tab iframe');
      if (iframe && iframe.getAttribute('data-src')) {
        iframe.setAttribute('src', iframe.getAttribute('data-src'));
        iframe.removeAttribute('data-src');
      }
    }`);
fs.writeFileSync('index.html', idxHtml);

// Fix CSS
let css = fs.readFileSync('src/index.css', 'utf8');

// Fix loader animations from height to transform
css = css.replace(/@keyframes slideDown \{[\s\S]*?\}/, `@keyframes slideDown {
  0% { transform: scaleY(0); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: top; }
}`);
css = css.replace(/@keyframes slideUp \{[\s\S]*?\}/, `@keyframes slideUp {
  0% { transform: scaleY(0); transform-origin: bottom; }
  100% { transform: scaleY(1); transform-origin: bottom; }
}`);
// Replace height animations in classes
css = css.replace(/#loader-letterbox-top \{[\s\S]*?\}/, `#loader-letterbox-top {
  position: fixed; top: 0; left: 0; width: 100%; height: 15vh; background: var(--bg); z-index: 10001;
  transform: scaleY(0); transform-origin: top;
}`);
css = css.replace(/#loader-letterbox-bot \{[\s\S]*?\}/, `#loader-letterbox-bot {
  position: fixed; bottom: 0; left: 0; width: 100%; height: 15vh; background: var(--bg); z-index: 10001;
  transform: scaleY(0); transform-origin: bottom;
}`);

// Touch targets padding
if(!css.includes('.sn-item { padding: 12px; }')) {
  css += `\n.sn-item { padding: 12px; margin: -12px; }\n.cinema-nav { padding: 16px; }\n`;
}

fs.writeFileSync('src/index.css', css);

// Netlify & Vercel Caching Configs
fs.writeFileSync('netlify.toml', `
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`);

fs.writeFileSync('vercel.json', JSON.stringify({
  headers: [
    { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    { source: "/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }] }
  ]
}, null, 2));

console.log("Fixes applied successfully.");
