const html = require('fs').readFileSync('tally-form.html','utf8');
const match = html.match(/window\.__TALLY_FORM_CONFIG__\s*=\s*({.*});/);
if (match) {
  const config = JSON.parse(match[1]);
  config.blocks.forEach(b => {
    if (b.type.startsWith('INPUT') || b.type === 'MULTIPLE_CHOICE' || b.type === 'TEXTAREA') {
      console.log(`ID: ${b.id}, Type: ${b.type}, Label: ${b.content?.text}`);
    }
  });
} else {
  console.log('No config found');
}
