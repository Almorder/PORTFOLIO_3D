const fs = require('fs');
const path = require('path');

const reactInjection = `
<!-- HYBRID REACT MOUNTS (GOOGLE SAUCE) -->
<style>
  html, body { background-color: transparent !important; }
  #pageTransition { pointer-events: none !important; background: transparent !important; }
  .arc-bg { display: none !important; opacity: 0; }
</style>
<div id="react-3d-root"></div>
<script type="module" src="/src/main.tsx"></script>
</body>
`;

['ma-demarche.html', 'mentions-legales.html'].forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove DOCTYPE typo if it exists from older files
    content = content.replace(/<!DOC[^T]/i, '<!DOCTYPE html>\n<html');
    
    // Inject React
    if (!content.includes('id="react-3d-root"')) {
      content = content.replace(/<\/body>/i, reactInjection);
    }
    fs.writeFileSync(filePath, content);
  }
});
console.log("Hooks React injectés nativement dans les pages du client.");
