import { motion, useMotionValue, useTransform } from 'framer-motion';

const TiltCard = ({ title, desc, number }: { title: string, desc: string, number: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [20, -20]);
  const rotateY = useTransform(x, [-100, 100], [-20, 20]);

  return (
    <motion.div
      style={{ x, y, rotateX, rotateY, z: 100 }}
      drag
      dragElastic={0.16}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      whileTap={{ cursor: 'grabbing' }}
      className="glass-heavy p-8 rounded-2xl cursor-grab relative overflow-hidden group min-h-[400px] hover:border-orange/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-dim/40 font-yrsa italic text-6xl absolute top-4 right-6">{number}</span>
      <h3 className="font-yrsa italic text-4xl mb-4 text-white relative z-10">{title}</h3>
      <p className="text-dim font-sans text-sm relative z-10">{desc}</p>
      
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-500">
        <span className="text-xs font-syne uppercase tracking-widest text-orange">En savoir plus</span>
        <span className="text-orange">→</span>
      </div>
    </motion.div>
  );
};

export const Services = () => {
  return (
    <section id="services" className="py-32 max-w-7xl mx-auto px-6 md:px-12 relative z-10">
      <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
        <div>
          <h2 className="font-yrsa italic text-5xl md:text-7xl">Expertises.</h2>
          <p className="text-dim mt-4 max-w-md text-sm leading-relaxed">
            De la direction artistique complète à la capture brute de l'instant. Une démarche organique pour des marques souveraines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-[1000px]">
        <TiltCard 
          number="01" 
          title="Films de marque" 
          desc="Création de campagnes visuelles fortes. De la direction artistique au montage." 
        />
        <TiltCard 
          number="02" 
          title="Événementiel" 
          desc="Captation premium et organique de vos événements, soirées, et célébrations." 
        />
        <TiltCard 
          number="03" 
          title="Direction Artistique" 
          desc="Stratégie visuelle, photographie et conseil pour une image de marque inaltérable." 
        />
      </div>
    </section>
  );
};
