// Admin Nolan Arc : envoi des images et des vidéos du site (photos, projets, images du site, social media videos).
// Chaque image est réduite dans le navigateur aux tailles réellement affichées (deux fichiers WebP, grande et
// petite), qualité ajustée jusqu'au poids visé, métadonnées et position GPS retirées (le dessin sur un canvas
// ne garde que les pixels). Les vidéos sont envoyées telles quelles (50 Mo maximum) et une miniature est tirée
// d'une image de la vidéo. Au déploiement, tools/fetch-published.mjs copie tout sur nolanarc.com.
// Aucune donnée n'est injectée en HTML.
(() => {
  const BUCKET = 'site-photos', VIDEO_BUCKET = 'site-videos';
  const MAX_SOURCE = 40 * 1024 * 1024;
  const MAX_VIDEO = 50 * 1024 * 1024;
  const VIDEO_TYPES = { 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' };
  // Taille la plus longue (px) et poids visé (octets) par usage : grande taille pour un écran large et net,
  // petite taille pour le téléphone et les vignettes (srcset).
  const PRESETS = {
    photo: { large: [1600, 200 * 1024], small: [800, 90 * 1024] },
    cover: { large: [1080, 160 * 1024], small: [540, 70 * 1024] },
    folder: { large: [1200, 180 * 1024], small: [640, 80 * 1024] },
    polaroid: { large: [900, 150 * 1024], small: [480, 70 * 1024] },
    card: { large: [1000, 140 * 1024], small: [480, 60 * 1024] }
  };
  const pathsOf = id => [`${id}.webp`, `${id}-s.webp`];
  const noDash = text => String(text || '').replace(/[\u2014\u2013]/g, '-');
  const kb = bytes => `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  const mb = bytes => `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;

  // Encode en WebP : qualité de 0,82 à 0,5 ; si le poids reste trop haut, l'image est réduite de 15 % et on recommence.
  const encode = async (source, [side, budget]) => {
    // Une vidéo donne ses dimensions dans videoWidth / videoHeight (width / height valent 0).
    const sw = source.videoWidth || source.width, sh = source.videoHeight || source.height;
    if (!sw || !sh) throw new Error('image illisible');
    let scale = Math.min(1, side / Math.max(sw, sh));
    for (let round = 0; ; round++) {
      const width = Math.max(1, Math.round(sw * scale)), height = Math.max(1, Math.round(sh * scale));
      const canvas = Object.assign(document.createElement('canvas'), { width, height });
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source, 0, 0, width, height);
      let blob = null;
      for (let q = 0.82; q >= 0.5; q -= 0.06) {
        blob = await new Promise(done => canvas.toBlob(done, 'image/webp', q));
        if (!blob || blob.type !== 'image/webp') throw new Error('ce navigateur ne sait pas produire d’images WebP (utilise Chrome, Edge ou Firefox)');
        if (blob.size <= budget) return { blob, width, height };
      }
      if (round >= 4) return { blob, width, height };
      scale *= 0.85;
    }
  };

  const previews = new Map();
  window.NolanMedia = (client, inUse = () => false) => {
    const publicUrl = (bucket, path) => client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    const put = async (bucket, path, blob, type, name) => {
      const { error } = await client.storage.from(bucket).upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false });
      if (error) throw new Error(`envoi de ${name} impossible : ${error.message}`);
    };
    // Image (fichier ou image tirée d'une vidéo) -> deux WebP. Renvoie l'image et le bilan d'optimisation.
    const storeSource = async (source, sourceBytes, preset, name) => {
      const p = PRESETS[preset] || PRESETS.photo;
      const large = await encode(source, p.large), small = await encode(source, p.small);
      const id = crypto.randomUUID();
      const [pLarge, pSmall] = pathsOf(id);
      await put(BUCKET, pLarge, large.blob, 'image/webp', name);
      await put(BUCKET, pSmall, small.blob, 'image/webp', name);
      previews.set(id, URL.createObjectURL(small.blob));
      const image = { id, width: large.width, height: large.height, smallWidth: small.width, smallHeight: small.height, bytes: large.blob.size, smallBytes: small.blob.size };
      const gain = sourceBytes ? Math.max(0, Math.round((1 - large.blob.size / sourceBytes) * 100)) : 0;
      return { image, report: `Optimisé : ${kb(large.blob.size)} (écran large), ${kb(small.blob.size)} (téléphone)${gain ? `, -${gain} % par rapport à l’original (${sourceBytes > 1048576 ? mb(sourceBytes) : kb(sourceBytes)})` : ''}` };
    };
    const store = async (file, preset = 'photo') => {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name} : formats acceptés JPEG, PNG ou WebP`);
      if (file.size > MAX_SOURCE) throw new Error(`${file.name} dépasse 40 Mo`);
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      try { return await storeSource(bitmap, file.size, preset, file.name); } finally { bitmap.close?.(); }
    };
    // Vidéo : vérifiée par le navigateur (lisible, durée, dimensions), envoyée telle quelle, miniature automatique.
    const storeVideo = async file => {
      const ext = VIDEO_TYPES[file.type];
      if (!ext) throw new Error(`${file.name} : formats acceptés MP4, MOV ou WebM`);
      if (file.size > MAX_VIDEO) throw new Error(`${file.name} pèse ${mb(file.size)} : 50 Mo maximum (exporte une version plus légère, par exemple en 1080 px)`);
      const url = URL.createObjectURL(file);
      const video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, preload: 'auto', src: url });
      try {
        await new Promise((ok, ko) => { video.onloadedmetadata = ok; video.onerror = () => ko(new Error(`${file.name} : ce navigateur ne sait pas lire cette vidéo (préfère un MP4 H.264)`)); });
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        await new Promise(ok => { video.onseeked = ok; video.currentTime = Math.min(1, duration / 10 || 0); setTimeout(ok, 4000); });
        const id = crypto.randomUUID();
        await put(VIDEO_BUCKET, `${id}.${ext}`, file, file.type, file.name);
        const thumb = await storeSource(video, 0, 'cover', file.name);
        return { video: { id, ext, type: file.type, bytes: file.size, width: video.videoWidth, height: video.videoHeight, duration: Math.round(duration) }, cover: thumb.image, report: `Vidéo envoyée : ${mb(file.size)}, ${video.videoWidth} × ${video.videoHeight}, ${Math.round(duration)} s. Miniature automatique : ${thumb.report.replace('Optimisé : ', '')}` };
      } finally { URL.revokeObjectURL(url); }
    };
    // Aperçu : lu par fetch puis affiché en blob: (la politique de sécurité n'autorise aucune image venant
    // directement de Supabase, et le site public n'en a pas besoin).
    const preview = (img, id) => {
      if (previews.has(id)) { img.src = previews.get(id); return; }
      fetch(publicUrl(BUCKET, pathsOf(id)[1]), { cache: 'force-cache' }).then(r => r.ok ? r.blob() : Promise.reject(new Error(r.status))).then(blob => {
        const url = URL.createObjectURL(blob); previews.set(id, url); img.src = url;
      }).catch(() => { img.alt = 'Aperçu indisponible'; });
    };
    // Suppression des fichiers d'images : jamais ceux qu'un autre bloc utilise encore (une photo peut servir
    // à la fois dans Photographie et dans un projet).
    const remove = async ids => {
      const gone = [...new Set(ids)].filter(id => id && !inUse(id));
      if (gone.length) await client.storage.from(BUCKET).remove(gone.flatMap(pathsOf));
      gone.forEach(id => { const url = previews.get(id); if (url) { URL.revokeObjectURL(url); previews.delete(id); } });
    };
    const removeVideo = async video => { if (video?.id && !inUse(video.id)) await client.storage.from(VIDEO_BUCKET).remove([`${video.id}.${video.ext}`]); };
    return { store, storeVideo, preview, remove, removeVideo, noDash, kb, mb, MAX_VIDEO };
  };
})();
