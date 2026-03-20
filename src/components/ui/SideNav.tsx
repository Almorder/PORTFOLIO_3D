import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'ACCUEIL' },
  { id: 'work', label: 'WORK' },
  { id: 'services', label: 'SERVICES' },
  { id: 'contact', label: 'CONTACT' },
];

export const SideNav = () => {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[90] hidden md:flex flex-col items-end gap-0">
      {/* Vertical Line */}
      <div className="absolute right-[2px] top-0 bottom-0 w-[1px] bg-white/10" />
      
      {/* Progress Line Orange */}
      <motion.div 
        className="absolute right-[2px] top-0 w-[1px] bg-orange"
        initial={{ height: 0 }}
        animate={{ 
          height: `${(SECTIONS.findIndex(s => s.id === activeSection) / (SECTIONS.length - 1)) * 100}%` 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />

      {SECTIONS.map((section, i) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="group relative flex items-center gap-4 py-3 outline-none"
        >
          <span className={`text-[10px] font-syne tracking-widest transition-all duration-300 opacity-0 group-hover:opacity-100 ${activeSection === section.id ? 'text-orange opacity-100' : 'text-dim'}`}>
            {section.label}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full border transition-all duration-500 z-10 ${
            activeSection === section.id 
              ? 'bg-orange border-orange scale-150 shadow-[0_0_10px_rgba(204,70,12,0.5)]' 
              : i < SECTIONS.findIndex(s => s.id === activeSection)
                ? 'bg-orange/40 border-orange/40'
                : 'bg-transparent border-white/20'
          }`} />
        </button>
      ))}
    </div>
  );
};
