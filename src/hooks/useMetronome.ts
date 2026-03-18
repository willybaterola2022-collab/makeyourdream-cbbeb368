import { useRef, useCallback } from "react";

export function useMetronome(bpm: number) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(0 as any);

  const start = useCallback(() => {
    if (bpm <= 0) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const tick = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.08;
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    };

    tick();
    intervalRef.current = setInterval(tick, (60 / bpm) * 1000);
  }, [bpm]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  return { start, stop };
}
