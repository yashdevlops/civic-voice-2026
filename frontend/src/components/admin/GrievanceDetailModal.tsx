"use client";

import React, { useState, useEffect } from "react";
import { GrievanceTicket, IssueStatus } from "@/lib/grievance";
import { getGrievanceById, updateGrievanceStatus } from "@/lib/grievanceStore";
import Modal from "@/components/auth/Modal";
import StatusSelector from "./StatusSelector";
import { MapPin, Mail, Phone, User, Calendar, MessageSquare, ShieldAlert } from "lucide-react";
import { useToast } from "@/lib/toast";

interface GrievanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  currentOfficerId: string;
}

export default function GrievanceDetailModal({
  isOpen,
  onClose,
  ticketId,
  currentOfficerId,
}: GrievanceDetailModalProps) {
  const { toast } = useToast();

  // Form state for status update
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>("Pending");
  const [updateNote, setUpdateNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Live ticket fetching
  const liveTicket = getGrievanceById(ticketId);

  // Populate local select box when modal opens
  useEffect(() => {
    if (liveTicket) {
      setSelectedStatus(liveTicket.status);
      setUpdateNote("");
    }
  }, [ticketId, liveTicket?.status]);

  // Gracefully handle ticket deletion in another tab
  useEffect(() => {
    if (isOpen && !liveTicket) {
      alert("This ticket was removed or deleted by another administrator.");
      onClose();
    }
  }, [isOpen, liveTicket, onClose]);

  if (!liveTicket) {
    return null;
  }

  // Handle status update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate ~300ms latency
    await new Promise((res) => setTimeout(res, 300));

    const updated = updateGrievanceStatus(
      liveTicket.id,
      selectedStatus,
      updateNote.trim() ? updateNote.trim() : undefined,
      currentOfficerId
    );

    if (updated) {
      toast(`Ticket ${liveTicket.id} status updated to ${selectedStatus}!`, "success");
      setUpdateNote("");
    } else {
      toast("Failed to update status. Please try again.", "error");
    }
    setSubmitting(false);
  };

  // Sort notes oldest first
  const sortedNotes = (liveTicket.adminNotes || []).slice().sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket Details — ${liveTicket.id}`}
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 text-slate-600 text-xs font-semibold">
        
        {/* Title and Category */}
        <div className="space-y-2">
          <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
            {liveTicket.category}
          </span>
          <h2 className="text-base font-extrabold text-slate-800 leading-snug">
            {liveTicket.title}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Submitted on {new Date(liveTicket.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Issue Description
          </h4>
          <p className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
            {liveTicket.description}
          </p>
        </div>

        {/* Evidence Photo */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Photo Evidence
          </h4>
          {liveTicket.imageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-100 max-h-[200px] flex items-center justify-center bg-slate-50">
              <img
                src={liveTicket.imageUrl}
                alt="Evidence"
                className="max-h-[200px] w-auto object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 py-6 text-center text-slate-400 font-semibold flex items-center justify-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-slate-300" />
              <span>No photo evidence submitted</span>
            </div>
          )}
        </div>

        {/* Locality with Google Maps link */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Location
          </h4>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(liveTicket.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-amber-50 hover:border-amber-100 transition-colors group"
          >
            <MapPin className="h-4.5 w-4.5 text-slate-400 group-hover:text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-slate-700 font-bold group-hover:text-amber-700">
                {liveTicket.location}
              </p>
              {liveTicket.landmark && (
                <p className="text-[10px] text-slate-400 font-semibold">
                  Landmark: {liveTicket.landmark}
                </p>
              )}
              <span className="inline-block text-[9px] text-amber-700 underline font-bold pt-1">
                View on Google Maps →
              </span>
            </div>
          </a>
        </div>

        {/* Citizen Contact */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Citizen Contact Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700 truncate">{liveTicket.citizenName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500 truncate" title={liveTicket.citizenEmail}>
                {liveTicket.citizenEmail}
              </span>
            </div>
            {liveTicket.citizenPhone && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 font-mono">{liveTicket.citizenPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status History Timeline (Oldest First) */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Timeline Status History
          </h4>
          
          <div className="relative pl-5 border-l-2 border-slate-100 space-y-4 ml-2.5">
            {sortedNotes.map((note, index) => {
              const isLast = index === sortedNotes.length - 1;
              return (
                <div key={index} className="relative">
                  {/* Circle marker */}
                  <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white shadow-sm ring-2 ${
                    isLast ? "ring-amber-500 bg-amber-500 animate-pulse" : "ring-slate-350 bg-slate-200"
                  }`} />
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px]">
                      <span className="font-bold text-slate-700 uppercase tracking-wide">
                        {note.status}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {new Date(note.changedAt).toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-medium font-mono">
                        (By: {note.changedByOfficerId})
                      </span>
                    </div>
                    {note.note && (
                      <p className="bg-white border border-slate-100 rounded-lg p-2 text-slate-600 font-medium leading-relaxed">
                        {note.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Status Update Area */}
        <form onSubmit={handleUpdate} className="space-y-4 pt-3 border-t border-slate-100">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare className="h-4.5 w-4.5 text-amber-600" />
            <span>Update Status & Record Logs</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Select dropdown */}
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                New Status
              </label>
              <StatusSelector
                currentStatus={selectedStatus}
                onChange={setSelectedStatus}
              />
            </div>

            {/* Note textarea */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="modal-log-note" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Action Log Note (Optional)
              </label>
              <textarea
                id="modal-log-note"
                rows={2}
                placeholder="Brief summary of actions taken..."
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-control text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving Logs…" : "Update Status"}
            </button>
          </div>
        </form>

      </div>
    </Modal>
  );
}
