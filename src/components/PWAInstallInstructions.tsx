import { useState, useEffect } from 'react';
import { Share, Download, X, Smartphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PWAInstallInstructions() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setShow(false);
      return;
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    // Show after a delay if not dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none"
        >
          <div className="bg-slate-900 text-white p-6 border-4 border-slate-900 shadow-brutal-lg pointer-events-auto relative overflow-hidden">
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-500 border-2 border-white flex items-center justify-center shrink-0">
                <Smartphone size={24} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-black text-lg leading-tight uppercase mb-2">Instalar App</h4>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                  Para usar offline e ter acesso rápido, adicione o Casa em Dia à sua tela inicial.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
              {platform === 'ios' ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Share size={16} strokeWidth={3} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-tight">
                    Toque em <span className="text-blue-400">Compartilhar</span> e depois em <br/>
                    <span className="text-emerald-400">"Adicionar à Tela de Início"</span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Download size={16} strokeWidth={3} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-tight">
                    Toque nos <span className="text-emerald-400">três pontos</span> do navegador e escolha <br/>
                    <span className="text-emerald-400">"Instalar Aplicativo"</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 bg-slate-800 p-3">
              <Info size={14} className="text-blue-400 shrink-0" strokeWidth={3} />
              <p className="text-[9px] font-black uppercase text-slate-400">
                O Casa em Dia funciona como um PWA (Web App Progressivo) nativo.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
