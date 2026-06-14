import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
      {/* 
        Le canvas R3F est en mode 'fixed inset-0' dans BackgroundScene, 
        donc pas besoin de le remettre ici, il vit derrière tout le site.
      */}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
        
        {/* Availability Badge */}
        <motion.div 
          className="glass rounded-full px-6 py-2 mb-12 flex items-center gap-3 backdrop-blur-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
          <span className="text-[10px] uppercase font-syne tracking-[0.2em] text-dim">Disponible · Réservation ouverte</span>
        </motion.div>

        {/* Main Title Yrsa */}
        <motion.h1 
          className="font-yrsa italic text-7xl md:text-[9rem] lg:text-[12rem] leading-[0.85] tracking-tight mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Nolan<span className="text-orange">.</span>Arc
        </motion.h1>

        {/* Subtitle / Kicker */}
        <motion.p 
          className="text-dim text-sm md:text-xl font-sans max-w-2xl mx-auto mb-16 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Ce qui ne se revit pas, <strong className="text-white font-medium">je le capture.</strong> <br/>
          Réalisateur freelance — Films de marque & Événementiel exclusif.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <a href="#contact" className="bg-orange text-bg px-8 py-4 rounded-full font-syne uppercase text-xs tracking-widest hover:bg-white transition-all magnetic">
            Parlons de ton projet →
          </a>
          <a href="#work" className="text-xs uppercase font-syne tracking-widest text-white border-b border-transparent hover:border-white transition-colors pb-1 magnetic">
            Voir le travail
          </a>
        </motion.div>

      </div>
    </section>
  );
};
