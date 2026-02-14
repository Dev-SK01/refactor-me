import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, User, Hand, Move, Coffee } from 'lucide-react';

const icons = {
  visual: Monitor,
  posture: User,
  wrist: Hand,
  lowerBody: Move,
  default: Coffee,
};

const animations = {
  visual: {
    animate: { opacity: [1, 0.5, 1], scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  posture: {
    animate: { scaleY: [1, 1.1, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
  },
  wrist: {
    animate: { rotate: [0, 15, -15, 0] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  lowerBody: {
    animate: { y: [0, -20, 0] },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  },
  default: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

export const Overlay = () => {
  const [timeLeft, setTimeLeft] = useState(-1);
  const [breakType, setBreakType] = useState('visual');
  const [details, setDetails] = useState({ title: '', description: '' });

  useEffect(() => {
    // Notify main process that overlay is ready to receive data
    // @ts-ignore
    window.ipcRenderer.send('overlay-ready');
    
    // @ts-ignore
    const removeListener = window.ipcRenderer.on('break-trigger', ({ type, strictMode, duration, title, description }) => {
      console.log('Overlay: Received break-trigger', { type, duration, title, description });
      setBreakType(type);
      setDetails({ 
        title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Break`, 
        description: description || 'Take a moment to relax.' 
      });
      setTimeLeft(duration);
    });
    return () => removeListener();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && breakType) {
       // Only auto-close if not strict mode? Or always user explicit? 
       // Keeping explicit close for now as per previous logic, but ready for auto-close if needed
    }
  }, [timeLeft, breakType]);

  // @ts-ignore
  const IconComponent = icons[breakType] || icons.default;
  // @ts-ignore
  const animationProps = animations[breakType] || animations.default;

  return (
    <div className="h-screen w-screen bg-black/90 text-white flex flex-col items-center justify-center p-8 text-center overflow-hidden relative">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-900/20 to-emerald-900/20 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <motion.div
           key={breakType}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="relative z-10 flex flex-col items-center"
        >
          <motion.div
            className="mb-8 p-6 bg-white/10 rounded-full backdrop-blur-sm shadow-2xl shadow-indigo-500/10"
            {...animationProps}
          >
            <IconComponent className="w-24 h-24 text-indigo-300" strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-indigo-200 to-white bg-clip-text text-transparent">
            {details.title}
          </h1>
          
          <div className="text-8xl font-mono font-bold text-white/90 mb-6 tracking-wider">
            {timeLeft > 0 ? (
              <>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </>
            ) : (
              "0:00"
            )}
          </div>
          
          <p className="text-2xl text-zinc-300 max-w-2xl font-light leading-relaxed">
            {details.description}
          </p>

           {timeLeft === 0 && (
             <motion.button 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={async () => {
                 console.log('Overlay: "Im Back" clicked');
                 try {
                    // @ts-ignore
                    if (window.ipcRenderer) {
                        console.log('Overlay: Invoking break-complete');
                        // @ts-ignore
                        await window.ipcRenderer.invoke('break-complete');
                        console.log('Overlay: break-complete invoked');
                    } else {
                        console.error('Overlay: ipcRenderer not found!');
                    }
                 } catch (error) {
                    console.error('Overlay: Error handling break completion:', error);
                 }
               }}
               className="mt-12 px-10 py-4 bg-emerald-600! hover:bg-emerald-500 rounded-full font-bold text-xl transition-all shadow-lg hover:shadow-emerald-500/25 cursor-pointer titlebar-no-drag"
             >
               I'm Back
             </motion.button>
           )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
