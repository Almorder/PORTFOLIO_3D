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

  // Iframes without title
  c = c.replace(/<iframe(?!.*title=)([^>]*)src="([^"]+)"([^>]*)>/gi, (match, p1, src, p2) => {
    let title = "Contenu embarqué";
    if (src.includes('youtube')) title = "Vidéo YouTube";
    else if (src.includes('vimeo')) title = "Vidéo Vimeo";
    else if (src.includes('calendly')) title = "Calendly prise de rendez-vous";
    return `<iframe title="${title}" ${p1}src="${src}"${p2}>`;
  });

  // Buttons without text or aria-label
  c = c.replace(/<button([^>]*)id="testiPrev"([^>]*)>/gi, '<button$1id="testiPrev"$2 aria-label="Témoignage précédent">');
  c = c.replace(/<button([^>]*)id="testiNext"([^>]*)>/gi, '<button$1id="testiNext"$2 aria-label="Témoignage suivant">');
  c = c.replace(/<button([^>]*)class="asl-dot([^"]*)"([^>]*)>/gi, (match, p1, p2, p3) => {
    if (match.includes('aria-label')) return match;
    return `<button${p1}class="asl-dot${p2}"${p3} aria-label="Aller à la diapositive">`;
  });
  c = c.replace(/<button([^>]*)id="mobileNavToggle"([^>]*)>/gi, (match, p1, p2) => {
    if (match.includes('aria-label')) return match;
    return `<button${p1}id="mobileNavToggle"$2 aria-label="Ouvrir le menu">`;
  });

  // Social links without text or aria-label (we saw foot-soc-link had aria-label already)
  // Check any <a> with just an SVG or icon
  c = c.replace(/<a([^>]*)class="work-voir"([^>]*)>/gi, (match, p1, p2) => {
      if (match.includes('aria-label')) return match;
      return `<a${p1}class="work-voir"${p2} aria-label="Voir le projet">`;
  });

  fs.writeFileSync(f, c);
  console.log('Processed a11y in ' + f);
});
