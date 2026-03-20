import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Step {
  icon: string;
  title: string;
  description: string;
}

interface MicroTutorialProps {
  steps: Step[];
  storageKey: string;
}

export default function MicroTutorial({ steps, storageKey }: MicroTutorialProps) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`tutorial-${storageKey}`) === "1"; } catch { return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(`tutorial-${storageKey}`, "1"); } catch {}
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="glass-card p-4 relative"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15, type: "spring" }}
                className="flex flex-col items-center gap-1.5 min-w-[64px]"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                <p className="text-[10px] font-bold text-foreground text-center leading-tight">{step.title}</p>
                <p className="text-[9px] text-muted-foreground text-center leading-tight">{step.description}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.15 }}
                  className="text-muted-foreground text-xs"
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
