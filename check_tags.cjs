const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function checkTags(tag) {
  const openRegex = new RegExp(`<${tag}[>\\s]`, 'g');
  const closeRegex = new RegExp(`</${tag}>`, 'g');
  const opens = (html.match(openRegex) || []).length;
  const closes = (html.match(closeRegex) || []).length;
  console.log(`${tag}: +${opens} -${closes} = ${opens - closes}`);
}

checkTags('div');
checkTags('section');
checkTags('main');
checkTags('a');
