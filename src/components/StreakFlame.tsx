import { cn } from "@/lib/utils";

interface StreakFlameProps {
  days: number;
  className?: string;
}

export function StreakFlame({ days, className }: StreakFlameProps) {
  const tier = days >= 100 ? "volcano" : days >= 31 ? "bonfire" : days >= 8 ? "medium" : "small";
  const scale = tier === "volcano" ? "scale-125" : tier === "bonfire" ? "scale-110" : tier === "medium" ? "scale-100" : "scale-90";

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <svg
        viewBox="0 0 24 24"
        className={cn("w-5 h-5 transition-transform", scale)}
        fill="none"
      >
        <path
          d="M12 2C12 2 7 8 7 13C7 16.87 9.24 19 12 19C14.76 19 17 16.87 17 13C17 8 12 2 12 2Z"
          fill="url(#flame-gradient)"
          className="animate-pulse-amber"
        />
        {(tier === "bonfire" || tier === "volcano") && (
          <path
            d="M12 6C12 6 9 10 9 13C9 15.21 10.34 17 12 17C13.66 17 15 15.21 15 13C15 10 12 6 12 6Z"
            fill="url(#flame-inner)"
            opacity={0.7}
          />
        )}
        <defs>
          <linearGradient id="flame-gradient" x1="12" y1="2" x2="12" y2="19" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(40 55% 68%)" />
            <stop offset="1" stopColor="hsl(22 52% 54%)" />
          </linearGradient>
          <linearGradient id="flame-inner" x1="12" y1="6" x2="12" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(37 80% 92%)" />
            <stop offset="1" stopColor="hsl(40 55% 58%)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-mono text-xs text-primary">{days}</span>
    </span>
  );
}
