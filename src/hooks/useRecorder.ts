import { useState, useRef, useCallback } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);

  const startRecording = useCallback((stream: MediaStream) => {
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
    };
    recorderRef.current = recorder;
    recorder.start(250); // collect chunks every 250ms
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setAudioBlob(null);
    setAudioUrl(null);
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const clearRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  }, [audioUrl]);

  return { isRecording, audioBlob, audioUrl, duration, startRecording, stopRecording, clearRecording };
}
