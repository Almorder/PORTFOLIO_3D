import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PROJECTS = [
  { id: 1, title: 'Lumière d\'Automne', category: 'Film de marque', tag: 'Cinématique', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1600' },
  { id: 2, title: 'Vœux Éternels', category: 'Événementiel', tag: 'Intime', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1600' },
  { id: 3, title: 'Sillage', category: 'Direction Artistique', tag: 'Puissant', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1600' },
  { id: 4, title: 'Origine', category: 'Documentaire', tag: 'Poétique', img: 'https://images.unsplash.com/photo-1518131672697-611eb14fcce3?auto=format&fit=crop&q=80&w=1600' },
];

export const Work = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  // Ce composant "remplace" l'intérieur de #workGrid existant, 
  // on retourne juste la "sauce Google" avec les cartes en verre et le swipe physique
  return (
    <div ref={containerRef} className="pl-6 md:pl-12 py-10 cursor-grab active:cursor-grabbing overflow-visible w-full min-h-[60vh] flex items-center">
      <motion.div 
        className="flex gap-8"
        drag="x"
        dragConstraints={{ right: 0, left: -2500 }}
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
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-bg/40 group-hover:bg-bg/10 transition-colors duration-500 z-10" />
              <motion.img 
                src={project.img} 
                alt={project.title}
                className="w-full h-full object-cover select-none pointer-events-none"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              
              {/* Interface Overlay Glassmorphism (Sauce Framer) */}
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex justify-between items-end bg-gradient-to-t from-bg/90 to-transparent">
                <div>
                  <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] uppercase font-syne tracking-wider text-white mb-3 inline-block font-bold">
                    {project.tag}
                  </span>
                  <h3 className="font-yrsa italic text-3xl md:text-4xl text-white">{project.title}</h3>
                  <p className="text-dim text-sm font-sans mt-1">{project.category}</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover:bg-orange transition-colors duration-500">
                  <span className="text-white text-lg">→</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
