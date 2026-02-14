import { useToastStore } from '../stores/useToastStore';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Toast = () => {
  const { message, type, isVisible, hideToast } = useToastStore();

  const icons = {
    success: <Check className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />,
  };

  const bgColors = {
    success: 'bg-zinc-900/90 border-emerald-500/20',
    error: 'bg-zinc-900/90 border-red-500/20',
    info: 'bg-zinc-900/90 border-indigo-500/20',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${bgColors[type]} z-50`}
        >
          {icons[type]}
          <span className="text-zinc-200 text-sm font-medium">{message}</span>
          <button 
            onClick={hideToast}
            className="ml-2 hover:bg-zinc-800 p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
