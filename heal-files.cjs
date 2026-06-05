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
</html>
`;

// 1. Heal Mentions Légales
const legalPath = path.join(__dirname, 'mentions-legales.html');
if (fs.existsSync(legalPath)) {
  let content = fs.readFileSync(legalPath, 'utf8');
  if (content.includes("Le présent site et ses mentions légales sont soumis")) {
    // Cut at the truncation point and heal
    content = content.split("Le présent site et ses mentions légales sont soumis")[0] + 
              "Le présent site et ses mentions légales sont soumis au droit français. Tout litige relatif à l'utilisation du site est soumis à la compétence exclusive des tribunaux français.</p></div></div>";
    
    // Inject React
    content = content.replace(/<\/body>|<\/html>/gi, ''); // clean existing if any
    content += reactInjection;
    fs.writeFileSync(legalPath, content);
  }
}

// 2. Heal Démarche
const demarchePath = path.join(__dirname, 'demarche.html');
if (fs.existsSync(demarchePath)) {
  let content = fs.readFileSync(demarchePath, 'utf8');
  if (content.includes("window.scrollY")) {
    // Heal the scroll script
    content = content.split("window.scrollY")[0] + 
              "window.scrollY > 300); });\n  btn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });\n})();\n</script>";
    
    // Inject React
    content = content.replace(/<\/body>|<\/html>/gi, ''); // clean existing if any
    content += reactInjection;
    fs.writeFileSync(demarchePath, content);
  }
}

console.log("Fichiers HTML réparés et injectés.");
