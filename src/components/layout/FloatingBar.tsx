import { Play, SkipBack, SkipForward, Volume2, Timer } from "lucide-react";

export function FloatingBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 glass-card border-t border-border/40 backdrop-blur-2xl flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-xs font-medium text-foreground truncate">Bésame Mucho</p>
          <p className="text-[10px] text-muted-foreground">Consuelo Velázquez</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <SkipBack className="h-4 w-4" />
        </button>
        <button className="h-10 w-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
          <Play className="h-4 w-4 ml-0.5" />
        </button>
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Timer className="h-4 w-4" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
            <div className="w-1/3 h-full gold-gradient rounded-full" />
          </div>
          <span className="text-[10px] text-muted-foreground">1:24</span>
        </div>
      </div>
    </div>
  );
}
