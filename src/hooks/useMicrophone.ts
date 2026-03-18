import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export function useMicrophone(fftSize = 256) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const updateData = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // Normalize to 0-100
    const normalized = Array.from(data).map((v) => (v / 255) * 100);
    setWaveformData(normalized);

    // RMS volume
    const rms = Math.sqrt(data.reduce((sum, v) => sum + v * v, 0) / data.length);
    setVolume(Math.min((rms / 255) * 100 * 2, 100));

    rafRef.current = requestAnimationFrame(updateData);
  }, []);

  const requestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = fftSize;
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsListening(true);
      rafRef.current = requestAnimationFrame(updateData);
    } catch {
      toast.error("Permiso de micrófono necesario para esta función");
      return false;
    }
    return true;
  }, [fftSize, updateData]);

  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
    setWaveformData([]);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close();
    };
  }, []);

  return { isListening, volume, waveformData, requestMic, stopMic, stream: streamRef.current, analyserNode: analyserRef.current };
}
