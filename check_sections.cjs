const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
let opens = [];
lines.forEach((l, i) => {
  if (l.match(/<section[^>]*>/)) {
    const id = l.match(/id="([^"]+)"/);
    opens.push(`Line ${i+1}: OPEN section ${id ? id[1] : ''}`);
  }
  if (l.includes('</section>')) {
    opens.push(`Line ${i+1}: CLOSE section`);
  }
});
console.log(opens.join('\n'));
