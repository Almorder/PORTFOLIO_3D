import { motion } from 'framer-motion';

export const Contact = () => {
  return (
    <section id="contact" className="py-32 relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          <div>
            <motion.h2 
              className="font-yrsa italic text-6xl md:text-8xl mb-8 leading-none"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Parlons de <br/>
              <span className="text-orange">ton projet.</span>
            </motion.h2>
            <p className="text-dim text-lg max-w-sm mb-12">
              Chaque film commence par une discussion. Une idée brute. Un besoin d'authenticité.
            </p>
            
            <div className="space-y-6">
              <div>
                <span className="block text-xs uppercase font-syne tracking-widest text-dim mb-2">Email direct</span>
                <a href="mailto:contact@nolanarc.com" className="font-yrsa italic text-3xl hover:text-orange transition-colors">contact@nolanarc.com</a>
              </div>
              <div className="h-px w-12 bg-white/20" />
              <div>
                <span className="block text-xs uppercase font-syne tracking-widest text-dim mb-2">Instagram</span>
                <a href="https://instagram.com/nolan_arc" target="_blank" rel="noreferrer" className="font-yrsa italic text-3xl hover:text-orange transition-colors">@nolan_arc</a>
              </div>
            </div>
          </div>

          {/* Formulaire Glassmorphism Très Premium */}
          <motion.div 
            className="glass-heavy p-8 md:p-12 rounded-2xl relative overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Lueur d'arrière-plan */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange/10 blur-[100px] rounded-full pointer-events-none" />

            <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative group">
                  <input type="text" id="name" required className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-orange transition-colors peer placeholder-transparent" placeholder="Nom" />
                  <label htmlFor="name" className="absolute left-0 top-3 text-dim text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-orange peer-valid:-top-4 peer-valid:text-xs">Ton Nom</label>
                </div>
                <div className="relative group">
                  <input type="email" id="email" required className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-orange transition-colors peer placeholder-transparent" placeholder="Email" />
                  <label htmlFor="email" className="absolute left-0 top-3 text-dim text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-orange peer-valid:-top-4 peer-valid:text-xs">Ton Email</label>
                </div>
              </div>

              <div className="relative group">
                <textarea id="message" rows={4} required className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-orange transition-colors peer placeholder-transparent resize-none" placeholder="Message"></textarea>
                <label htmlFor="message" className="absolute left-0 top-3 text-dim text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-orange peer-valid:-top-4 peer-valid:text-xs">Ton Projet</label>
              </div>

              <button type="submit" className="group flex items-center gap-4 bg-white/5 hover:bg-orange/20 border border-white/10 hover:border-orange text-white py-4 px-8 rounded-full transition-all w-full md:w-auto uppercase font-syne text-xs tracking-widest magnetic">
                <span>Envoyer</span>
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
