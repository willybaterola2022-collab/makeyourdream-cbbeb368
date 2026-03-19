import { motion } from "framer-motion";

interface Props {
  targetNote?: string;
  onNoteClick: (note: string) => void;
  feedback?: "correct" | "wrong" | null;
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

export function HeroPiano({ targetNote, onNoteClick, feedback }: Props) {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow behind piano */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 350, height: 200, top: "20%" }}
        animate={{
          boxShadow: [
            "0 0 50px 20px hsl(45 80% 50% / 0.15)",
            "0 0 80px 35px hsl(45 80% 50% / 0.25)",
            "0 0 50px 20px hsl(45 80% 50% / 0.15)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Target note display */}
      {targetNote && (
        <motion.div
          key={targetNote}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mb-6 text-5xl md:text-7xl font-serif font-bold ${
            feedback === "correct" ? "text-emerald-400" : feedback === "wrong" ? "text-destructive" : ""
          }`}
          style={!feedback ? { color: "hsl(45 80% 60%)" } : undefined}
        >
          🎵 {targetNote?.replace(/\d/, "")}
        </motion.div>
      )}

      {/* Piano keyboard */}
      <div className="relative flex z-10">
        {KEYS.map((key, i) => (
          <motion.button
            key={`${key.note}-${i}`}
            onClick={() => onNoteClick(`${key.note}4`)}
            whileTap={{ scale: 0.95, y: 3 }}
            className={
              key.black
                ? "relative -mx-3 z-20 w-8 h-24 md:w-10 md:h-28 rounded-b-lg flex items-end justify-center pb-2 text-[8px] font-bold"
                : "relative w-12 h-36 md:w-14 md:h-44 rounded-b-xl border flex items-end justify-center pb-3 text-[10px] font-bold"
            }
            style={
              key.black
                ? { background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", color: "hsl(0 0% 50%)" }
                : { background: "linear-gradient(to bottom, hsl(0 0% 95%), hsl(0 0% 85%))", borderColor: "hsl(0 0% 70%)", color: "hsl(0 0% 40%)" }
            }
          >
            {key.note}
          </motion.button>
        ))}
      </div>

      {/* Label */}
      {!targetNote && (
        <motion.p
          className="mt-6 text-lg md:text-2xl font-bold uppercase tracking-[0.2em]"
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
