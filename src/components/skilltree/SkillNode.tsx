import { motion } from "framer-motion";
import { Lock, Clock, Check } from "lucide-react";
import { SkillNodeData } from "./skillTreeData";

interface SkillNodeProps {
  node: SkillNodeData;
  index: number;
  onClick: (node: SkillNodeData) => void;
}

export function SkillNode({ node, index, onClick }: SkillNodeProps) {
  const Icon = node.icon;
  const isBoss = node.isBoss;
  const scale = isBoss ? (node.id === "p10" ? "scale-[1.5]" : "scale-[1.3]") : "";

  const statusStyles: Record<string, string> = {
    completed: "border-[#00E5A0] bg-[#00E5A0]/10 shadow-[0_0_20px_-4px_#00E5A0]",
    unlocked: "border-transparent bg-[#FF3CAC]/8",
    locked: "border-white/10 bg-white/[0.03] opacity-50",
    "coming-soon": "border-dashed border-white/[0.08] bg-transparent opacity-30",
  };

  return (
    <motion.div
      className="flex flex-col items-center relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {node.status === "coming-soon" && (
        <span className="absolute -top-3 text-[9px] font-bold uppercase tracking-widest text-white/40 bg-white/5 px-2 py-0.5 rounded-full z-10">
          Próximamente
        </span>
      )}

      <div className="relative">
        {/* Boss golden corona rings */}
        {isBoss && node.status !== "coming-soon" && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-2xl"
                style={{ border: "2px solid #FFA502" }}
                animate={{ scale: [1, 1.25 + i * 0.12], opacity: [0.5 - i * 0.12, 0] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </>
        )}

        {/* Completed green corona */}
        {node.status === "completed" && !isBoss && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: "1px solid #00E5A0" }}
            animate={{ scale: [1, 1.15], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        <motion.button
          onClick={() => onClick(node)}
          whileTap={node.status === "unlocked" || node.status === "completed" ? { scale: 0.95 } : {}}
          animate={node.status === "unlocked" ? { scale: [1, 1.03, 1] } : {}}
          transition={node.status === "unlocked" ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
          className={`
            relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
            border-2 transition-all ${scale}
            ${statusStyles[node.status]}
            ${isBoss && node.status !== "coming-soon" ? "!border-[#FFA502] shadow-[0_0_25px_-6px_#FFA502]" : ""}
          `}
        >
          {/* Gradient border overlay for unlocked */}
          {node.status === "unlocked" && (
            <div
              className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] -z-10"
              style={{
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
          )}

          {node.status === "completed" ? (
            <div className="flex flex-col items-center gap-0.5">
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-[#00E5A0]/60" />
              <Check className="h-4 w-4 text-[#00E5A0]" strokeWidth={3} />
            </div>
          ) : node.status === "locked" ? (
            <Lock className="h-5 w-5 md:h-6 md:w-6 text-[#A0A0B0]" />
          ) : node.status === "coming-soon" ? (
            <div className="flex flex-col items-center gap-0.5">
              <Clock className="h-4 w-4 text-[#555]" />
              <Lock className="h-3 w-3 text-[#555]" />
            </div>
          ) : (
            <Icon className="h-6 w-6 md:h-7 md:w-7 text-[#FF3CAC]" />
          )}
        </motion.button>
      </div>

      <p
        className={`mt-2 text-[10px] md:text-xs font-bold text-center max-w-[80px] md:max-w-[100px] leading-tight ${
          node.status === "coming-soon" ? "text-white/20" : node.status === "locked" ? "text-white/40" : "text-white/80"
        }`}
      >
        {node.name}
      </p>

      {/* Reward badge preview for completed */}
      {node.status === "completed" && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-[10px] mt-0.5"
        >
          {node.rewardBadge.split(" ")[0]}
        </motion.span>
      )}
    </motion.div>
  );
}
