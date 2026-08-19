"use client";

import React, { useState } from "react";
import { Mic, Square, Play, Pause, Bot, CheckCircle2, MessageSquare, Sparkles, Volume2 } from "lucide-react";
import { MunicipalDeptCode } from "@/lib/grievance";

interface AudioVoiceRecorderProps {
  onAutoFill: (data: {
    title: string;
    description: string;
    departmentCode: MunicipalDeptCode;
    wardId: string;
    priority: "HIGH" | "MEDIUM";
  }) => void;
}

export default function AudioVoiceRecorder({ onAutoFill }: AudioVoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);

  const handleStartRecord = () => {
    setRecording(true);
    setRecorded(false);
    setTimerSeconds(0);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          setRecording(false);
          setRecorded(true);
          return 6;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleAnalyzeAudio = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onAutoFill({
        title: "High-Pressure Water Trunk Pipeline Leakage on Patia Main Road",
        description: "Transcribed Odia/Hindi Input: 'ଆମ ୱାର୍ଡ ୧୫ ରେ ପାଣି ପାଇପ୍ ଫାଟି ଯାଇଛି, ରାସ୍ତା ଉପରେ ପାଣି ଜମି ରହିଛି।' → English: High-pressure water pipe burst in Ward 15 causing water logging on Patia main arterial road.",
        departmentCode: "water_supply",
        wardId: "BMC Ward 15",
        priority: "HIGH",
      });
    }, 1000);
  };

  return (
    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 font-sans text-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold">
            <Mic className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 font-display">
              🎙️ Record Regional Voice Complaint (Odia / Hindi / English)
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              Speak naturally in Odia, Hindi or English. AI will transcribe and pre-fill form fields.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWhatsappModal(true)}
          className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <MessageSquare className="h-3 w-3 text-emerald-600" />
          WhatsApp Bot
        </button>
      </div>

      {/* Recording Controls Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
        {!recording && !recorded && (
          <button
            type="button"
            onClick={handleStartRecord}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/20"
          >
            <Mic className="h-4 w-4 animate-bounce" />
            <span>Start Voice Recording</span>
          </button>
        )}

        {recording && (
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="font-mono font-extrabold text-red-600">
                Recording… 00:0{timerSeconds} / 00:06
              </span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full animate-pulse" />
              <div className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" />
              <div className="w-1.5 h-7 bg-emerald-600 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {recorded && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-emerald-600" />
              <span className="font-mono font-bold text-slate-700">Voice Note Recorded (00:06)</span>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeAudio}
              disabled={analyzing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {analyzing ? (
                <span>Transcribing Odia/Hindi…</span>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  <span>Analyze Audio & Auto-Fill Form</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-slate-800 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                BMC WhatsApp Grievance Bot
              </h3>
              <button onClick={() => setShowWhatsappModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <p className="text-slate-600">
              Prefer filing via WhatsApp? Send photos, location pins, or Odia/Hindi voice notes directly to BMC:
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center font-mono font-extrabold text-emerald-900 text-sm">
              📲 +91 94370 20260
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Automated AI parser turns WhatsApp media into official BMC Grievance Tickets instantly.
            </p>
            <button onClick={() => setShowWhatsappModal(false)} className="w-full btn-primary text-xs py-2">
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
