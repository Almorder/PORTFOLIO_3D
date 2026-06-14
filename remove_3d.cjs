const fs = require('fs');
const path = require('path');

const walk = d => {
  let res = [];
  fs.readdirSync(d).forEach(f => {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory() && f !== 'node_modules' && f !== 'dist') {
      res = res.concat(walk(p));
    } else if (f.endsWith('.html')) {
      res.push(p);
    }
  });
  return res;
};

walk('.').forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // Replace the React 3D root with the video background placeholder
  const replacement = `
<div class="fallback-glow" style="position:fixed;inset:0;z-index:-10;background:radial-gradient(circle at center, rgba(204,70,12,0.15) 0%, transparent 50%);pointer-events:none;"></div>
<video id="arc-bg-video" autoplay loop muted playsinline style="position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-10;opacity:0.6;pointer-events:none;"></video>
`;
  c = c.replace(/<div id="react-3d-root"><\/div>/g, replacement);
  
  // Remove the main.tsx script import
  c = c.replace(/<script type="module" src="\/src\/main\.tsx"><\/script>/g, '');
  
  fs.writeFileSync(f, c);
  console.log('Fixed ' + f);
});
