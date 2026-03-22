import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "danger" | "monolith" | "capsule" | "lever";

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
    "bg-primary text-primary-foreground shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)]",
  glass:
    "bg-card/60 backdrop-blur-xl border border-border/40 text-foreground hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]",
  danger:
    "bg-destructive text-destructive-foreground shadow-[0_0_24px_-6px_hsl(var(--destructive)/0.5)]",
  monolith:
    "min-h-[72px] md:min-h-[80px] bg-background border-2 border-primary/40 text-foreground shadow-[inset_0_1px_0_hsl(var(--primary)/0.15),0_0_40px_-10px_hsl(var(--primary)/0.35)] hover:border-primary/60 hover:shadow-[inset_0_1px_0_hsl(var(--primary)/0.2),0_0_50px_-10px_hsl(var(--primary)/0.4)]",
  capsule:
    "px-4 py-2 min-h-0 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] text-muted-foreground text-xs tracking-widest hover:bg-primary/10 hover:border-primary/30 hover:text-foreground",
  lever:
    "px-4 py-2 min-h-0 rounded-lg bg-muted border border-border/40 text-muted-foreground text-xs hover:bg-muted/80 hover:text-foreground",
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

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: isMonolith ? 1.01 : 1.02 }}
      className={cn(
        "relative px-6 rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base flex items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden",
        !isCapsule && !["lever"].includes(variant) && "min-h-[56px] md:min-h-[64px]",
        variantStyles[variant],
        active && variant === "capsule" && "bg-primary/15 border-primary/40 text-foreground shadow-[0_0_20px_-6px_hsl(var(--primary)/0.3)]",
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
    >
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-2xl border-2 border-primary/40"
          animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
