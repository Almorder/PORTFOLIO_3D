import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PROJECTS = [
  { id: 1, title: 'Film de marque', category: 'Publicité', tag: 'Professionnel', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1600', slug: 'film-de-marque' },
  { id: 2, title: 'Film de mariage', category: 'Événementiel', tag: 'Émotion', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1600', slug: 'mariage' },
  { id: 3, title: 'Direction artistique', category: 'Design', tag: 'Vision', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1600', slug: 'direction-artistique' },
  { id: 4, title: 'Film institutionnel', category: 'Entreprise', tag: 'Sérieux', img: 'https://images.unsplash.com/photo-1518131672697-611eb14fcce3?auto=format&fit=crop&q=80&w=1600', slug: 'film-institutionnel' },
  { id: 5, title: 'Demande en mariage', category: 'Capture', tag: 'Surprise', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1600', slug: 'demande-en-mariage' },
  { id: 6, title: 'Contenu social', category: 'Réseaux', tag: 'Dynamique', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1600', slug: 'contenu-social' },
  { id: 7, title: 'Stratégie visuelle', category: 'Branding', tag: 'Cohérence', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1600', slug: 'strategie-visuelle' },
];

export const Work = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Amplitude augmentée pour 7 projets
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  return (
    <div ref={containerRef} className="pl-6 md:pl-12 py-10 cursor-grab active:cursor-grabbing overflow-visible w-full min-h-[60vh] flex items-center">
      <motion.div 
        className="flex gap-8"
        drag="x"
        dragConstraints={{ right: 0, left: -4500 }}
        dragElastic={0.2}
        style={{ x }}
      >
        {PROJECTS.map((project, i) => (
          <motion.div 
            key={project.id}
            className="min-w-[85vw] md:min-w-[45vw] lg:min-w-[40vw] group relative glass-heavy p-2 rounded-2xl overflow-hidden magnetic"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
          >
            <a href={`/projet/${project.slug}/`} className="block relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-bg/40 group-hover:bg-bg/10 transition-colors duration-500 z-10" />
              <img 
                src={project.img} 
                alt={project.title}
                className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Interface Overlay Glassmorphism */}
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex justify-between items-end bg-gradient-to-t from-bg/90 to-transparent">
                <div>
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] uppercase font-syne tracking-wider text-white mb-3 inline-block font-bold">
                    {project.tag}
                  </span>
                  <h3 className="font-yrsa italic text-3xl md:text-4xl text-white">{project.title}</h3>
                  <p className="text-dim text-sm font-sans mt-1">{project.category}</p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[8px] uppercase font-syne tracking-widest text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Voir la vidéo</span>
                  <div className="w-12 h-12 rounded-full border border-orange/40 flex items-center justify-center bg-orange shadow-[0_0_20px_rgba(204,70,12,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(204,70,12,0.6)]">
                    <span className="text-white text-lg">→</span>
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
