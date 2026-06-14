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

const brokenURL = 'https://fonts.googleapis.com/css2?family=Yrsa:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap&family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap';
const fixedURL = 'https://fonts.googleapis.com/css2?family=Yrsa:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap';

walk('.').forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes(brokenURL)) {
    content = content.replace(brokenURL, fixedURL);
    fs.writeFileSync(f, content);
    console.log('Fixed font in ' + f);
  }
  
  // Also check if any other weird display=swaps are there
  if (content.includes('&display=swap&family=')) {
    content = content.replace(/&display=swap&family=/g, '&family=');
    fs.writeFileSync(f, content);
    console.log('Fixed double swap in ' + f);
  }
});
