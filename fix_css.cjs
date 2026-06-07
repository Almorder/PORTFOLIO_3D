const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'ma-demarche.html',
  'projet/contenu-social/index.html',
  'projet/demande-en-mariage/index.html',
  'projet/direction-artistique/index.html',
  'projet/film-de-marque/index.html',
  'projet/film-institutionnel/index.html',
  'projet/le-bol-den-face/index.html',
  'projet/mariage/index.html',
  'projet/strategie-visuelle/index.html'
];

for (const relPath of files) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remove the broken keyframes remnant
  content = content.replace(/to\{width:22px;\}\}\n/g, "");
  
  fs.writeFileSync(fullPath, content);
  console.log(`Fixed CSS in ${relPath}`);
}
