"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw, Play, Pause } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type RecorderState = "idle" | "recording" | "recorded" | "error";

interface AudioRecorderProps {
  /** Called when the user has finished recording. Receives the audio Blob. */
  onAudioReady: (blob: Blob) => void;
  /** Called when the user clears the recording. */
  onAudioClear?: () => void;
}

export default function AudioRecorder({ onAudioReady, onAudioClear }: AudioRecorderProps) {
  const { t } = useI18n();
  const [state, setState] = useState<RecorderState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioElemRef.current) audioElemRef.current.pause();
    };
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage("");

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("error");
      setErrorMessage(t.recorderUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Stop all microphone tracks to release the indicator in the browser UI
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        setState("recorded");
        if (timerRef.current) clearInterval(timerRef.current);
        onAudioReady(blob);
      };

      recorder.start();
      setState("recording");
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.name === "NotAllowedError"
          ? t.recorderPermissionDenied
          : t.recorderUnsupported;
      setState("error");
      setErrorMessage(message);
    }
  }, [t, onAudioReady]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const reRecord = useCallback(() => {
    blobRef.current = null;
    if (audioElemRef.current) {
      audioElemRef.current.pause();
      audioElemRef.current = null;
    }
    setIsPlaying(false);
    setState("idle");
    setElapsedSeconds(0);
    onAudioClear?.();
  }, [onAudioClear]);

  const togglePlayback = useCallback(() => {
    if (!blobRef.current) return;

    if (!audioElemRef.current) {
      audioElemRef.current = new Audio(URL.createObjectURL(blobRef.current));
      audioElemRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElemRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElemRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="rounded border border-paper-dark bg-white p-3">
      {/* Idle state */}
      {state === "idle" && (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 text-sm text-civic hover:text-civic-light font-medium transition-colors"
        >
          <Mic className="h-4 w-4" />
          {t.recorderIdle}
        </button>
      )}

      {/* Recording state */}
      {state === "recording" && (
        <div className="flex items-center gap-3">
          {/* Pulsing indicator */}
          <div className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-4 w-4 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          </div>
          <span className="text-sm font-mono text-ink tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-xs text-ink/60">{t.recorderRecord}</span>
          <button
            type="button"
            onClick={stopRecording}
            className="ml-auto flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
            aria-label={t.recorderStop}
          >
            <Square className="h-4 w-4 fill-current" />
            {t.recorderStop}
          </button>
        </div>
      )}

      {/* Recorded state */}
      {state === "recorded" && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex items-center gap-1.5 text-sm text-civic font-medium"
            aria-label={isPlaying ? "Pause" : "Play recording"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="text-xs text-ink/60">
              {isPlaying ? "Playing…" : `Recording (${formatTime(elapsedSeconds)})`}
            </span>
          </button>
          <button
            type="button"
            onClick={reRecord}
            className={cn(
              "ml-auto flex items-center gap-1 text-xs text-ink/50 hover:text-ink/80",
              "transition-colors"
            )}
          >
            <RotateCcw className="h-3 w-3" />
            {t.recorderReRecord}
          </button>
        </div>
      )}

      {/* Error state */}
      {state === "error" && (
        <div className="flex items-start gap-2">
          <Mic className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
