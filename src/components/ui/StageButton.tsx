import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "glass" | "danger";

interface StageButtonProps {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  pulse?: boolean;
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
};

export function StageButton({
  variant = "primary",
  icon,
  children,
  className,
  onClick,
  disabled,
  pulse,
}: StageButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative min-h-[56px] md:min-h-[64px] px-6 rounded-2xl font-bold uppercase tracking-wider text-sm md:text-base flex items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden",
        variantStyles[variant],
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
    >
      {/* Pulse ring for CTAs */}
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
