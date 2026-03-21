import { motion, AnimatePresence } from "framer-motion";

export interface Discovery {
  id: string;
  badge: string;
  title: string;
  description: string;
}

interface DiscoveryMomentProps {
  discovery: Discovery | null;
  onClose: () => void;
}

export function DiscoveryMoment({ discovery, onClose }: DiscoveryMomentProps) {
  return (
    <AnimatePresence>
      {discovery && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[90] p-4 rounded-2xl border border-[#FFA502]/30"
          style={{ background: "linear-gradient(135deg, rgba(30,30,46,0.98), rgba(10,10,15,0.98))", backdropFilter: "blur(16px)" }}
        >
          <button onClick={onClose} className="absolute top-2 right-3 text-white/30 text-xs hover:text-white/60">✕</button>
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              {discovery.badge}
            </motion.span>
            <div>
              <p className="text-[10px] font-bold text-[#FFA502] uppercase tracking-widest">Logro Secreto</p>
              <p className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {discovery.title}
              </p>
              <p className="text-[11px] text-[#A0A0B0] mt-0.5">{discovery.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
