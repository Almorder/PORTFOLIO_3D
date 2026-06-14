const fs = require('fs');

let files = ['index.html', 'ma-demarche.html', 'mentions-legales.html', 'journal.html', '404.html', 'court-metrage-independant.html', 'film-entreprise.html', 'realisateur-paris.html', 'video-mariage-haut-de-gamme.html'];

const projFiles = fs.readdirSync('projet').filter(f => fs.statSync('projet/' + f).isDirectory()).map(d => 'projet/' + d + '/index.html');

files = files.concat(projFiles);

files.forEach(f => {
    if(!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/<div class="fallback-glow".*?><\/div>\s*<video id="arc-bg-video".*?><\/video>/gs, '<div id="react-3d-root" aria-hidden="true"></div>');
    // If <script type="module" src="/src/main.tsx"></script> doesn't exist, add it
    if(!c.includes('/src/main.tsx')) {
        c = c.replace(/<\/body>/g, '<script type="module" src="/src/main.tsx"></script>\n</body>');
    }
    fs.writeFileSync(f, c);
});
