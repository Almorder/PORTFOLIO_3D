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
  // Avoid double replacing by checking if width already exists
  c = c.replace(/<img([^>]*)>/gi, (match, p1) => {
    if (p1.includes('width=')) return match;
    return `<img width="400" height="400" ${p1}>`;
  });
  fs.writeFileSync(f, c);
  console.log('Processed img tags in ' + f);
});
