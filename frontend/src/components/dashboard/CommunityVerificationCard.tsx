"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, Camera, ShieldCheck, MapPin, Sparkles, Upload } from "lucide-react";
import { NearbyVerificationMission } from "@/lib/types/advancedFeatures";
import { useCivicCredits } from "@/lib/civicCreditStore";

interface CommunityVerificationCardProps {
  mission: NearbyVerificationMission;
}

export default function CommunityVerificationCard({ mission }: CommunityVerificationCardProps) {
  const { completeAudit } = useCivicCredits();
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(mission.status === "AUDITED_VALID");

  const handleAuditPhoto = () => {
    setUploading(true);
    setTimeout(() => {
      completeAudit(mission.id, "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80");
      setUploading(false);
      setCompleted(true);
    }, 800);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-xl space-y-4 font-sans relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between text-xs border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-extrabold text-emerald-300 uppercase tracking-widest text-[10px]">
            Geo-Fenced Community Audit Mission
          </span>
        </div>
        <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Award className="h-3 w-3" />
          +{mission.rewardCredits} Civic Credits
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <h4 className="text-sm font-extrabold text-white font-display leading-snug">
          🎯 {mission.title}
        </h4>
        <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          {mission.wardId} • 20m from your detected coordinates
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Municipal crew completed work at this location. Take a 5-second verification photo to confirm quality and earn <strong>{mission.rewardCredits} Credits</strong>!
        </p>
      </div>

      {/* Officer Proof Thumbnail */}
      <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs">
        <img
          src={mission.officerProofPhotoUrl}
          alt="Officer Resolution Proof"
          className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40 shrink-0"
        />
        <div className="space-y-0.5 text-[11px]">
          <span className="text-emerald-400 font-bold">Officer Proof Uploaded:</span>
          <p className="text-slate-300 line-clamp-1">Official Resolution Photo submitted by field crew.</p>
        </div>
      </div>

      {/* Action */}
      {completed ? (
        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Verified & +{mission.rewardCredits} Credits Added to Wallet!</span>
        </div>
      ) : (
        <button
          onClick={handleAuditPhoto}
          disabled={uploading}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <span>Validating Photo & Crediting Account…</span>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Upload Verification Photo (+{mission.rewardCredits} Credits)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
