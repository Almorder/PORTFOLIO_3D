import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-heavy py-4' : 'bg-transparent py-8'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a href="#" className="font-yrsa italic text-2xl tracking-tighter text-white">
            Nolan<span className="text-orange">.Arc</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Work', 'Services', 'Témoignages', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-xs uppercase font-syne tracking-widest text-dim hover:text-white transition-colors magnetic"
              >
                {item}
              </a>
            ))}
            <a href="#contact" className="ml-4 border border-white/20 px-6 py-3 rounded-full text-xs font-syne uppercase tracking-widest hover:bg-white hover:text-bg transition-all magnetic">
              Démarrer un projet
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMenuOpen(true)}
          >
            <Menu strokeWidth={1} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-3xl flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button 
              className="absolute top-8 right-6 text-white"
              onClick={() => setMenuOpen(false)}
            >
              <X strokeWidth={1} size={32} />
            </button>
            <div className="flex flex-col items-center gap-8">
              {['Work', 'Services', 'Témoignages', 'Contact', 'Ma démarche'].map((item, i) => (
                <motion.a 
                  key={item} 
                  href={item === 'Ma démarche' ? '/demarche.html' : `#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-yrsa text-5xl italic text-white hover:text-orange transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.6 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
