"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, Loader2, Info } from "lucide-react";
import Logo from "@/components/Logo";
import { addGrievance } from "@/lib/grievanceStore";
import { IssueCategory, IssuePriority } from "@/lib/grievance";

function CitizenReportForm() {
  // Form input states
  const [citizenName, setCitizenName] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Roads & Potholes");
  const [priority, setPriority] = useState<IssuePriority>("Medium");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // UI flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    // Simulate ~600ms network submit time
    await new Promise((res) => setTimeout(res, 600));

    try {
      const ticket = addGrievance({
        citizenName: citizenName.trim(),
        citizenEmail: citizenEmail.trim().toLowerCase(),
        citizenPhone: citizenPhone.trim() ? citizenPhone.trim() : undefined,
        title: title.trim(),
        description: description.trim(),
        category: category,
        priority: priority,
        location: location.trim(),
        landmark: landmark.trim() ? landmark.trim() : undefined,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
      });

      setSuccessTicketId(ticket.id);

      // Reset form fields
      setCitizenName("");
      setCitizenEmail("");
      setCitizenPhone("");
      setTitle("");
      setDescription("");
      setCategory("Roads & Potholes");
      setPriority("Medium");
      setLocation("");
      setLandmark("");
      setImageUrl("");
    } catch (err) {
      alert("Submission failed. Please verify form details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="sm" variant="dark" href="/" />
            
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content Form container */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-[520px] bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl font-extrabold text-slate-800 font-display">
              File a Municipal Complaint
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Submit local civic issues directly to municipal governance departments.
            </p>
          </div>

          {/* Success Dialog Banner */}
          {successTicketId && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-3 animate-fade-in text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-green-800 font-extrabold text-sm">Complaint Filed Successfully!</span>
              </div>
              <p className="leading-relaxed">
                Your report has been filed as <strong className="text-slate-800 font-mono text-sm underline">{successTicketId}</strong>. Municipal administrators will review your issue shortly.
              </p>
              <div className="flex justify-end gap-2 pt-1 font-bold">
                <button
                  onClick={() => setSuccessTicketId(null)}
                  className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  File Another Complaint
                </button>
              </div>
            </div>
          )}

          {!successTicketId && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-600">
              
              {/* Contact section */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>Citizen Contact Details</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div className="space-y-1">
                      <label htmlFor="report-name" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="report-name"
                        required
                        placeholder="e.g. Ananya Reddy"
                        className="civic-input px-3"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label htmlFor="report-email" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="report-email"
                        required
                        placeholder="ananya@example.com"
                        className="civic-input px-3"
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label htmlFor="report-phone" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                      Mobile Number (Optional)
                    </label>
                    <div className="relative flex items-center w-full">
                      <span className="absolute left-3.5 text-slate-400 font-bold text-sm select-none">+91</span>
                      <input
                        type="tel"
                        id="report-phone"
                        placeholder="98765 43210"
                        className="civic-input pl-12"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grievance Details */}
              <div className="space-y-3">
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="report-title" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                    Complaint Title
                  </label>
                  <input
                    type="text"
                    id="report-title"
                    required
                    placeholder="Brief summary of the issue..."
                    className="civic-input px-3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label htmlFor="report-desc" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                    Full Description
                  </label>
                  <textarea
                    id="report-desc"
                    required
                    rows={4}
                    placeholder="Provide details about the issue (what, when, how it is affecting the area)..."
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="space-y-1">
                    <label htmlFor="report-category" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                      Category
                    </label>
                    <select
                      id="report-category"
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                    >
                      <option value="Roads & Potholes">Roads & Potholes</option>
                      <option value="Sanitation & Waste">Sanitation & Waste</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Streetlights & Electricity">Streetlights & Electricity</option>
                      <option value="Public Safety">Public Safety</option>
                      <option value="Parks & Recreation">Parks & Recreation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label htmlFor="report-priority" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                      Priority Level
                    </label>
                    <select
                      id="report-priority"
                      className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as IssuePriority)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label htmlFor="report-loc" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                    Location Address
                  </label>
                  <input
                    type="text"
                    id="report-loc"
                    required
                    placeholder="e.g. 100ft Road, Indiranagar, Bengaluru"
                    className="civic-input px-3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Landmark */}
                  <div className="space-y-1">
                    <label htmlFor="report-landmark" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      id="report-landmark"
                      placeholder="e.g. near Metro Pillar 42"
                      className="civic-input px-3"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                    />
                  </div>

                  {/* Mock Image URL */}
                  <div className="space-y-1">
                    <label htmlFor="report-image" className="block text-slate-500 uppercase tracking-wide text-[9px] font-bold">
                      Photo URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="report-image"
                      placeholder="https://example.com/pothole.jpg"
                      className="civic-input px-3"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-control bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Filing Grievance…</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>File Complaint</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} CivicVoice. Citizen Report Space.</p>
      </footer>

    </div>
  );
}

export default function CitizenReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>}>
      <CitizenReportForm />
    </Suspense>
  );
}
