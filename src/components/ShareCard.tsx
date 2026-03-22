import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { StageButton } from "@/components/ui/StageButton";

interface ShareCardProps {
  dimensions: { name: string; value: number }[];
  globalScore: number;
  similarArtist: string;
  vocalRange: { low: string; high: string };
  onClose: () => void;
}

export default function ShareCard({ dimensions, globalScore, similarArtist, vocalRange, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 1080, h = 1350;
    canvas.width = w;
    canvas.height = h;

    // Background gradient — Luxury Íntimo
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#0a0a0f");
    bg.addColorStop(0.5, "#1a1208");
    bg.addColorStop(1, "#0a0a0f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MI VOCAL FINGERPRINT", w / 2, 100);

    // Radar chart
    const cx = w / 2, cy = 480, maxR = 200;
    const numDims = dimensions.length;
    const getPoint = (i: number, val: number) => {
      const angle = (2 * Math.PI * i) / numDims - Math.PI / 2;
      const r = (val / 100) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (const pct of [25, 50, 75, 100]) {
      ctx.beginPath();
      for (let i = 0; i <= numDims; i++) {
        const p = getPoint(i % numDims, pct);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Data polygon
    ctx.fillStyle = "rgba(212, 168, 83, 0.2)";
    ctx.strokeStyle = "rgba(212, 168, 83, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    dimensions.forEach((d, i) => {
      const p = getPoint(i, d.value);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dots and labels
    dimensions.forEach((d, i) => {
      const p = getPoint(i, d.value);
      ctx.fillStyle = "rgba(168, 85, 247, 1)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();

      const lp = getPoint(i, 125);
      ctx.fillStyle = "#aaa";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${d.name} ${d.value}`, lp.x, lp.y);
    });

    // Score
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 120px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${globalScore}`, w / 2, 820);
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#888";
    ctx.fillText("SCORE GLOBAL", w / 2, 860);

    // Similar artist
    ctx.font = "bold 36px sans-serif";
    ctx.fillStyle = "#a855f7";
    ctx.fillText(`🎤 Similar a ${similarArtist}`, w / 2, 960);

    // Range
    if (vocalRange.low) {
      ctx.font = "28px sans-serif";
      ctx.fillStyle = "#06b6d4";
      ctx.fillText(`Rango: ${vocalRange.low} → ${vocalRange.high}`, w / 2, 1020);
    }

    // Watermark
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "rgba(168, 85, 247, 0.5)";
    ctx.fillText("MakeYourDream", w / 2, 1250);
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText("makeyourdream.lovable.app", w / 2, 1290);
  }, [dimensions, globalScore, similarArtist, vocalRange]);

  const downloadCard = useCallback(() => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "mi-vocal-fingerprint.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [drawCard]);

  // Draw on mount
  const canvasCallback = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node) {
        (canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = node;
        setTimeout(drawCard, 50);
      }
    },
    [drawCard],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl p-4 max-w-md w-full space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-foreground">Tu Share Card</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground active:scale-95">
            <X className="h-5 w-5" />
          </button>
        </div>

        <canvas
          ref={canvasCallback}
          className="w-full rounded-xl"
          style={{ aspectRatio: "1080/1350" }}
        />

        <StageButton variant="primary" icon={<Download className="h-5 w-5" />} onClick={downloadCard} className="w-full">
          DESCARGAR IMAGEN
        </StageButton>
      </motion.div>
    </motion.div>
  );
}
