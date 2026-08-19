"use client";

import React, { useState } from "react";
import { X, Bot, Wrench, FileText, CheckCircle2, AlertTriangle, Layers, DollarSign, Calculator, Download } from "lucide-react";
import { GrievanceTicket } from "@/lib/grievance";
import { BoqEstimate } from "@/lib/types/advancedFeatures";

interface AiBoqEstimatorModalProps {
  ticket: GrievanceTicket;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiBoqEstimatorModal({ ticket, isOpen, onClose }: AiBoqEstimatorModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [estimated, setEstimated] = useState(false);

  if (!isOpen) return null;

  const sampleBoq: BoqEstimate = {
    ticketId: ticket.id,
    damageDimension: {
      lengthMeters: 4.2,
      widthMeters: 2.8,
      depthMeters: 0.15,
      areaSqMeters: 11.76,
    },
    requiredMaterials: [
      { materialName: "Bituminous Concrete (VG-30 Grade)", quantity: 1.8, unit: "Tonnes", estimatedUnitCost: 8000, totalCost: 14400 },
      { materialName: "Crushed Stone Aggregate Sub-Base", quantity: 2.4, unit: "Tonnes", estimatedUnitCost: 2583, totalCost: 6200 },
      { materialName: "Rapid-Setting Tack Coat Emulsion", quantity: 40, unit: "Litres", estimatedUnitCost: 95, totalCost: 3800 },
    ],
    laborCostEstimate: 5000,
    equipmentCostEstimate: 3500,
    totalEstimatedBudget: 32900,
    isTenderThresholdExceeded: false,
  };

  const handleRunCv = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setEstimated(true);
    }, 1200);
  };

  const handleExportPdf = () => {
    alert(`Exporting CPWD Standard Technical Work Order PDF for ${ticket.id} (Estimated Budget: ₹32,900).`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display">
                AI Computer Vision BOQ & Material Estimator
              </h2>
              <p className="text-[11px] text-slate-300 font-mono">
                Ticket #{ticket.id} • CPWD Scheduled Rates
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Target Ticket Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Target Incident Report:</span>
            <p className="font-bold text-slate-900 text-sm">{ticket.title}</p>
            <p className="text-slate-500">{ticket.addressText} ({ticket.wardId})</p>
          </div>

          {!estimated ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                <Calculator className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">Run Automated Photogrammetry & BOQ Calculation</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  AI scans uploaded photo to detect pothole depth, asphalt displacement area, and auto-calculates material quantities.
                </p>
              </div>
              <button
                onClick={handleRunCv}
                disabled={analyzing}
                className="btn-primary text-xs py-3 px-6 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {analyzing ? (
                  <span>Analyzing Damage Dimensions & Material Rates…</span>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    <span>Run AI Damage Dimension Analysis</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {/* Dimensions Box */}
              <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                  <span>📐 AI COMPUTER VISION DIMENSION ASSESSMENT</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">98.4% Confidence</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[9px] text-slate-400 block">Length</span>
                    <strong className="text-white text-sm">{sampleBoq.damageDimension.lengthMeters} m</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[9px] text-slate-400 block">Width</span>
                    <strong className="text-white text-sm">{sampleBoq.damageDimension.widthMeters} m</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[9px] text-slate-400 block">Depth</span>
                    <strong className="text-white text-sm">{sampleBoq.damageDimension.depthMeters} m</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-emerald-500">
                    <span className="text-[9px] text-emerald-400 block">Surface Area</span>
                    <strong className="text-emerald-300 text-sm">{sampleBoq.damageDimension.areaSqMeters} m²</strong>
                  </div>
                </div>
              </div>

              {/* BOQ Material Table */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
                  Bill of Quantities (CPWD / BMC Scheduled Rates)
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Material / Resource</th>
                        <th className="p-2.5">Quantity</th>
                        <th className="p-2.5">Unit Rate</th>
                        <th className="p-2.5 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {sampleBoq.requiredMaterials.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{m.materialName}</td>
                          <td className="p-2.5">{m.quantity} {m.unit}</td>
                          <td className="p-2.5">₹{m.estimatedUnitCost.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold">₹{m.totalCost.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-700">Skilled Mason & Labor Allocation (1 Shift)</td>
                        <td className="p-2.5">4 Staff</td>
                        <td className="p-2.5">CPWD Rate</td>
                        <td className="p-2.5 text-right font-bold">₹{sampleBoq.laborCostEstimate.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-700">Vibratory Roller & Machine Rental</td>
                        <td className="p-2.5">1 Shift</td>
                        <td className="p-2.5">Daily Shift</td>
                        <td className="p-2.5 text-right font-bold">₹{sampleBoq.equipmentCostEstimate.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary Strip */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Estimated Repair Budget</span>
                  <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ₹{sampleBoq.totalEstimatedBudget.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Within Division Maintenance SLA Budget
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary text-xs">Close</button>
          {estimated && (
            <button onClick={handleExportPdf} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Generate Technical Work Order PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
