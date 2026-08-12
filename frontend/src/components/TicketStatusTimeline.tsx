"use client";

import { CheckCircle2, Circle, XCircle, Clock, Camera } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDate, shortId, categoryClass } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { GrievancePublic } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface TicketStatusTimelineProps {
  grievance: GrievancePublic;
}

interface StepDef {
  key: GrievancePublic["status"];
  label: string;
  icon: React.ReactNode;
}

export default function TicketStatusTimeline({ grievance }: TicketStatusTimelineProps) {
  const { t } = useI18n();

  const isRejected = grievance.status === "REJECTED";

  // Standard flow steps
  const steps: StepDef[] = [
    { key: "OPEN", label: t.statusOpen, icon: <Circle className="h-4 w-4" /> },
    { key: "IN_PROGRESS", label: t.statusInProgress, icon: <Clock className="h-4 w-4" /> },
    { key: "RESOLVED", label: t.statusResolved, icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const statusOrder: Record<GrievancePublic["status"], number> = {
    OPEN: 0,
    IN_PROGRESS: 1,
    RESOLVED: 2,
    REJECTED: -1,
  };

  const currentOrder = statusOrder[grievance.status];

  return (
    <div
      className={cn(
        "ticket-card p-4 space-y-3",
        grievance.status === "RESOLVED" && "ticket-resolved"
      )}
      data-priority={grievance.priority_score}
    >
      {/* Ticket header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-slab text-sm font-semibold text-ink leading-snug line-clamp-2">
            {grievance.title}
          </h3>
          <p className="text-xs text-ink/50 mt-0.5">
            #{shortId(grievance.id)} · {formatDate(grievance.created_at)}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", categoryClass(grievance.category))}>
            {grievance.category}
          </span>
          {grievance.upvote_count > 1 && (
            <span className="text-xs text-amber-dark font-medium">
              👥 {grievance.upvote_count} {t.ticketUpvotes}
            </span>
          )}
        </div>
      </div>

      {/* Description snippet */}
      <p className="text-xs text-ink/70 leading-relaxed line-clamp-2">
        {grievance.description}
      </p>

      {/* Status timeline */}
      {!isRejected ? (
        <div className="flex items-center gap-0">
          {steps.map((step, idx) => {
            const stepOrder = statusOrder[step.key];
            const isComplete = currentOrder > stepOrder;
            const isCurrent = currentOrder === stepOrder;
            const isFuture = currentOrder < stepOrder;

            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                {/* Step dot + label */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                      isComplete && "bg-resolved border-resolved text-white",
                      isCurrent && "bg-amber-civic border-amber-civic text-ink",
                      isFuture && "bg-paper border-paper-dark text-ink/30"
                    )}
                  >
                    {step.icon}
                  </div>
                  <p
                    className={cn(
                      "text-[10px] mt-0.5 text-center leading-tight font-medium",
                      isComplete && "text-resolved",
                      isCurrent && "text-amber-dark",
                      isFuture && "text-ink/30"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
                {/* Connector line (not after last step) */}
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1",
                      currentOrder > stepOrder ? "bg-resolved" : "bg-paper-dark"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-ink/50">
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="font-medium">{t.statusRejected}</span>
        </div>
      )}

      {/* Resolution evidence (shown when resolved) */}
      {grievance.status === "RESOLVED" && grievance.evidence.length > 0 && (
        <div className="rounded-sm bg-resolved-bg border border-resolved/20 p-3 space-y-2">
          <p className="text-xs font-medium text-resolved uppercase tracking-wider">
            {t.ticketResolvedBy}
          </p>
          <p className="text-xs text-ink/70">{grievance.evidence[0].comments}</p>
          {grievance.evidence[0].proof_image_url && (
            <div>
              <div className="flex items-center gap-1 text-xs text-ink/50 mb-1">
                <Camera className="h-3 w-3" />
                Proof photo
              </div>
              <img
                src={`${API_BASE}${grievance.evidence[0].proof_image_url}`}
                alt="Resolution proof"
                className="w-24 h-16 object-cover rounded-sm border border-paper-dark"
              />
            </div>
          )}
          {!grievance.evidence[0].proof_image_url && (
            <p className="text-xs text-ink/40 italic">{t.ticketNoEvidence}</p>
          )}
        </div>
      )}
    </div>
  );
}
