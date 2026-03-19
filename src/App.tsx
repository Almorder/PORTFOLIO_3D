import { CustomCursor } from './components/ui/CustomCursor';
import { BackgroundScene } from './components/canvas/BackgroundScene';
import { Navbar } from './components/ui/Navbar';
import { Hero } from './sections/Hero';
import { Work } from './sections/Work';

function App() {
  return (
    <>
      {/* Visualiseur 3D persistant */}
      <BackgroundScene />
      
      {/* Curseur Magnétique Blend-Mode */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      {/* Main UI Layer (Glassmorphism & Layout) */}
      <div className="relative z-10">
        <Navbar />
        
        <main>
          <Hero />
          <Work />
          
          {/* Espace pour d'autres sections: Process, Services, Contact... */}
          <section id="services" className="py-32 min-h-[50vh] flex items-center justify-center">
             <h2 className="font-yrsa italic text-5xl text-dim">Services (À venir)</h2>
          </section>
          
          <section id="contact" className="py-32 min-h-[50vh] flex items-center justify-center">
             <div className="glass-heavy p-12 text-center max-w-2xl mx-auto">
               <h2 className="font-yrsa italic text-6xl text-white mb-6">Parlons de ton projet</h2>
               <a href="mailto:contact@nolanarc.com" className="text-orange font-syne uppercase tracking-widest text-sm hover:text-white transition-colors">contact@nolanarc.com</a>
             </div>
          </section>
        </main>
      </div>

      {/* Overlay global SVG grain (désactivé par défaut si la 3D suffit) */}
      <div className="film-grain"></div>
    </>
  );
}

export default App;
