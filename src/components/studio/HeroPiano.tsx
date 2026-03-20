import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  targetNote?: string;
  onNoteClick: (note: string) => void;
  feedback?: "correct" | "wrong" | null;
  instrument?: string;
}

const KEYS = [
  { note: "C", black: false }, { note: "C#", black: true },
  { note: "D", black: false }, { note: "D#", black: true },
  { note: "E", black: false },
  { note: "F", black: false }, { note: "F#", black: true },
  { note: "G", black: false }, { note: "G#", black: true },
  { note: "A", black: false }, { note: "A#", black: true },
  { note: "B", black: false },
];

export function HeroPiano({ targetNote, onNoteClick, feedback, instrument = "piano" }: Props) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleClick = (note: string) => {
    setPressedKey(note);
    onNoteClick(`${note}4`);
    setTimeout(() => setPressedKey(null), 300);
  };

  const feedbackColor = feedback === "correct" ? "hsl(160 70% 50%)" : feedback === "wrong" ? "hsl(0 70% 55%)" : null;

  return (
    <motion.div
      className="relative z-10 flex flex-col items-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow behind piano */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 400, height: 240, top: "10%" }}
        animate={{
          boxShadow: [
            "0 0 60px 25px hsl(45 80% 50% / 0.15)",
            "0 0 100px 40px hsl(45 80% 50% / 0.28)",
            "0 0 60px 25px hsl(45 80% 50% / 0.15)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Target note */}
      {targetNote && (
        <motion.div
          key={targetNote}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 mb-1">
            {instrument === "piano" ? "🎹" : instrument === "guitar" ? "🎸" : instrument === "sax" ? "🎷" : instrument === "bass" ? "🎸" : "🪈"} Toca la nota
          </p>
          <motion.span
            className="text-6xl md:text-8xl font-serif font-bold block"
            style={{ color: feedbackColor || "hsl(45 80% 60%)" }}
            animate={feedback === "wrong" ? { x: [-4, 4, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {targetNote?.replace(/\d/, "")}
          </motion.span>
        </motion.div>
      )}

      {/* Piano keyboard — premium large keys */}
      <div className="relative flex z-10 scale-[0.7] sm:scale-90 md:scale-100 origin-bottom">
        {KEYS.map((key, i) => {
          const isPressed = pressedKey === key.note;
          const isTarget = targetNote?.replace(/\d/, "") === key.note;
          const isCorrect = isTarget && feedback === "correct";
          const isWrong = isPressed && feedback === "wrong";

          return key.black ? (
            <motion.button
              key={`${key.note}-${i}`}
              onClick={() => handleClick(key.note)}
              whileTap={{ scale: 0.96, y: 3 }}
              animate={isWrong ? { x: [-2, 2, -2, 2, 0] } : {}}
              className="relative -mx-3.5 z-20 w-10 h-28 md:w-12 md:h-36 rounded-b-xl flex items-end justify-center pb-3 text-[9px] font-bold transition-all"
              style={{
                background: isCorrect
                  ? "linear-gradient(to bottom, hsl(160 70% 30%), hsl(160 70% 20%))"
                  : isWrong
                  ? "linear-gradient(to bottom, hsl(0 70% 30%), hsl(0 70% 20%))"
                  : "linear-gradient(to bottom, hsl(0 0% 12%), hsl(0 0% 6%))",
                border: "1px solid hsl(0 0% 20%)",
                color: isCorrect ? "hsl(160 70% 70%)" : "hsl(0 0% 45%)",
                boxShadow: isPressed
                  ? "inset 0 2px 8px hsl(0 0% 0%/0.6)"
                  : isCorrect
                  ? "0 0 20px hsl(160 70% 50%/0.4), inset 0 -3px 6px hsl(0 0% 0%/0.3)"
                  : "inset 0 -3px 6px hsl(0 0% 0%/0.3), 0 4px 8px hsl(0 0% 0%/0.4)",
              }}
            >
              {key.note}
            </motion.button>
          ) : (
            <motion.button
              key={`${key.note}-${i}`}
              onClick={() => handleClick(key.note)}
              whileTap={{ scale: 0.97, y: 2 }}
              animate={isWrong ? { x: [-2, 2, -2, 2, 0] } : {}}
              className="relative w-14 h-40 md:w-16 md:h-52 rounded-b-2xl border flex items-end justify-center pb-4 text-[11px] font-bold transition-all"
              style={{
                background: isCorrect
                  ? "linear-gradient(to bottom, hsl(160 70% 80%), hsl(160 70% 65%))"
                  : isWrong
                  ? "linear-gradient(to bottom, hsl(0 70% 80%), hsl(0 70% 65%))"
                  : isPressed
                  ? "linear-gradient(to bottom, hsl(0 0% 88%), hsl(0 0% 78%))"
                  : "linear-gradient(to bottom, hsl(0 0% 96%), hsl(0 0% 86%))",
                borderColor: isCorrect ? "hsl(160 70% 50%)" : "hsl(0 0% 72%)",
                color: isCorrect ? "hsl(160 70% 30%)" : "hsl(0 0% 40%)",
                boxShadow: isPressed
                  ? "inset 0 3px 10px hsl(0 0% 0%/0.15)"
                  : isCorrect
                  ? "0 0 25px hsl(160 70% 50%/0.35), inset 0 -4px 8px hsl(0 0% 0%/0.08), 0 6px 12px hsl(0 0% 0%/0.15)"
                  : "inset 0 -4px 8px hsl(0 0% 0%/0.08), 0 6px 12px hsl(0 0% 0%/0.15)",
              }}
            >
              {key.note}
            </motion.button>
          );
        })}
      </div>

      {/* Label */}
      {!targetNote && (
        <motion.p
          className="mt-8 text-lg md:text-2xl font-bold uppercase tracking-[0.2em]"
          style={{ color: "hsl(45 80% 60%)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎹 ENTRENA TU OÍDO 🎹
        </motion.p>
      )}
    </motion.div>
  );
}
