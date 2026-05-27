import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-gold-dark" />
  };

  const bgColors = {
    success: 'bg-emerald-50/90 border-emerald-200',
    error: 'bg-red-50/90 border-red-200',
    info: 'bg-gold-light/90 border-gold/30'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center shadow-lg rounded-2xl backdrop-blur-md border px-4 py-3 min-w-[300px]"
          style={{ zIndex: 9999 }}
        >
          <div className={`absolute inset-0 rounded-2xl ${bgColors[type]} backdrop-blur-md pointer-events-none -z-10`} />
          <div className="flex-shrink-0 mr-3">
            {icons[type]}
          </div>
          <p className="text-sm font-medium text-ink flex-1 mr-4">{message}</p>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
