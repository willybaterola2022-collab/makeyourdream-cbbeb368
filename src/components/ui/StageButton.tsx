import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "glass" | "danger" | "monolith" | "launchpad" | "capsule" | "scan" | "lever";

interface StageButtonProps {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
  active?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[hsl(275_85%_55%)] to-[hsl(275_85%_65%)] text-primary-foreground shadow-[0_0_24px_-6px_hsl(275_85%_60%/0.5)]",
  accent:
    "bg-gradient-to-r from-[hsl(185_90%_45%)] to-[hsl(185_90%_55%)] text-accent-foreground shadow-[0_0_24px_-6px_hsl(185_90%_55%/0.5)]",
  glass:
    "bg-card/60 backdrop-blur-xl border border-border/40 text-foreground hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(275_85%_60%/0.3)]",
  danger:
    "bg-gradient-to-r from-[hsl(0_84%_55%)] to-[hsl(0_84%_65%)] text-destructive-foreground shadow-[0_0_24px_-6px_hsl(0_84%_60%/0.5)]",

  /* ── NEW VARIANTS ── */
  monolith:
    "min-h-[72px] md:min-h-[80px] bg-[hsl(0_0%_6%)] border-2 border-[hsl(275_85%_60%/0.4)] text-foreground shadow-[inset_0_1px_0_hsl(275_85%_60%/0.15),0_0_40px_-10px_hsl(275_85%_60%/0.35)] hover:border-[hsl(185_90%_55%/0.5)] hover:shadow-[inset_0_1px_0_hsl(185_90%_55%/0.2),0_0_50px_-10px_hsl(185_90%_55%/0.35)]",
  launchpad:
    "aspect-square bg-[hsl(0_0%_7%)] border border-[hsl(275_85%_60%/0.25)] text-foreground shadow-[inset_0_-4px_12px_hsl(0_0%_0%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.04),0_0_25px_-8px_hsl(275_85%_60%/0.2)] hover:shadow-[inset_0_-2px_8px_hsl(0_0%_0%/0.4),inset_0_1px_0_hsl(0_0%_100%/0.06),0_0_35px_-8px_hsl(275_85%_60%/0.3)] hover:border-[hsl(275_85%_60%/0.4)]",
  capsule:
    "px-4 py-2 min-h-0 rounded-full bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] text-muted-foreground text-xs tracking-widest hover:bg-[hsl(275_85%_60%/0.1)] hover:border-[hsl(275_85%_60%/0.3)] hover:text-foreground",
  scan:
    "bg-[hsl(0_0%_8%)] border border-[hsl(185_90%_55%/0.2)] text-foreground shadow-[inset_0_-3px_10px_hsl(0_0%_0%/0.4)] hover:border-[hsl(185_90%_55%/0.4)] hover:shadow-[inset_0_-3px_10px_hsl(0_0%_0%/0.4),0_0_30px_-10px_hsl(185_90%_55%/0.25)] overflow-hidden",
  lever:
    "px-4 py-2 min-h-0 rounded-lg bg-[hsl(0_0%_10%)] border border-border/40 text-muted-foreground text-xs hover:bg-[hsl(0_0%_12%)] hover:text-foreground",
};

export function StageButton({
  variant = "primary",
  icon,
  children,
  className,
  onClick,
  disabled,
  pulse,
  active,
}: StageButtonProps) {
  const isMonolith = variant === "monolith";
  const isCapsule = variant === "capsule";
  const isLaunchpad = variant === "launchpad";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95, y: isLaunchpad ? 2 : 0 }}
      whileHover={{ scale: isMonolith ? 1.01 : 1.02 }}
      className={cn(
        "relative px-6 rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base flex items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden",
        !isCapsule && !["lever"].includes(variant) && "min-h-[56px] md:min-h-[64px]",
        variantStyles[variant],
        active && variant === "capsule" && "bg-[hsl(275_85%_60%/0.15)] border-[hsl(275_85%_60%/0.4)] text-foreground shadow-[0_0_20px_-6px_hsl(275_85%_60%/0.3)]",
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
    >
      {/* Pulse ring */}
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-2xl border-2 border-primary/40"
          animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Scan line for scan variant */}
      {variant === "scan" && (
        <motion.span
          className="absolute left-0 right-0 h-[1px] bg-[hsl(185_90%_55%/0.4)]"
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Launchpad breathing line */}
      {isLaunchpad && (
        <motion.span
          className="absolute bottom-3 left-[20%] right-[20%] h-[2px] rounded-full bg-primary/30"
          animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
