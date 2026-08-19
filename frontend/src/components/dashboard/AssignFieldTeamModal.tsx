'use client';

import React, { useState } from 'react';
import { 
  MUNICIPAL_DEPARTMENT_REGISTRY, 
  FieldCrewUnit, 
  DepartmentLeadEngineer 
} from '@/lib/officerRegistry';
import { GrievanceTicket, MunicipalDeptCode } from '@/lib/grievance';
import { 
  UserCheck, 
  Truck, 
  Wrench, 
  Phone, 
  CheckCircle2, 
  X, 
  Building2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface AssignFieldTeamModalProps {
  ticket: GrievanceTicket;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAssignment: (ticketId: string, assignedName: string, assignedRole: string, contact: string) => void;
}

export const AssignFieldTeamModal: React.FC<AssignFieldTeamModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onConfirmAssignment
}) => {
  const deptCode = ticket.departmentCode as MunicipalDeptCode;
  const deptData = MUNICIPAL_DEPARTMENT_REGISTRY[deptCode] || MUNICIPAL_DEPARTMENT_REGISTRY.roads_potholes;

  const [selectedType, setSelectedType] = useState<'ENGINEER' | 'CREW' | 'CUSTOM'>('CREW');
  const [selectedCrewId, setSelectedCrewId] = useState<string>(deptData.crews[0]?.id || '');
  const [customName, setCustomName] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedType === 'ENGINEER') {
      const eng = deptData.leadEngineer;
      onConfirmAssignment(ticket.id, eng.name, `${eng.designation} (${eng.officialId})`, eng.contact);
    } else if (selectedType === 'CREW') {
      const crew = deptData.crews.find(c => c.id === selectedCrewId) || deptData.crews[0];
      onConfirmAssignment(ticket.id, crew.name, `${crew.unitCode}: ${crew.specialization} • Lead: ${crew.teamLead}`, crew.contact);
    } else {
      if (!customName.trim()) return;
      onConfirmAssignment(ticket.id, customName, customRole || 'Assigned Field Staff', '+91 94370 00000');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {deptData.departmentName}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              Deploy Field Team <span className="text-slate-400 font-mono text-base font-normal">#{ticket.id}</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Ticket Summary Strip */}
        <div className="bg-emerald-50/50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-emerald-900">Issue:</span>
            <span className="truncate">{ticket.title}</span>
          </div>
          <div className="font-medium text-emerald-800 shrink-0 bg-emerald-100/60 px-2 py-0.5 rounded">
            📍 {ticket.wardId}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* SECTION 1: SUPERVISING LEAD ENGINEER */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600"/>
              1. Direct Escalation to Supervising Lead Engineer
            </label>
            <div 
              onClick={() => setSelectedType('ENGINEER')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                selectedType === 'ENGINEER' 
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{deptData.leadEngineer.name}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {deptData.leadEngineer.officialId}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{deptData.leadEngineer.designation}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400"/> {deptData.leadEngineer.contact}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400"/> {deptData.leadEngineer.officeLocation}</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                selectedType === 'ENGINEER' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
              }`}>
                {selectedType === 'ENGINEER' && <CheckCircle2 className="w-4 h-4"/>}
              </div>
            </div>
          </div>

          {/* SECTION 2: SPECIALIZED OPERATIONAL CREWS (5 UNITS) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-600"/>
                2. Deploy Specialized Operational Field Crew (5 Dedicated Units)
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Active Division Units
              </span>
            </div>

            <div className="space-y-2.5">
              {deptData.crews.map((crew) => {
                const isSelected = selectedType === 'CREW' && selectedCrewId === crew.id;
                return (
                  <div
                    key={crew.id}
                    onClick={() => {
                      setSelectedType('CREW');
                      setSelectedCrewId(crew.id);
                    }}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded">
                          {crew.unitCode}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">{crew.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          crew.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {crew.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-slate-400"/> {crew.specialization}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                        <span><strong>Lead:</strong> {crew.teamLead}</span>
                        <span><strong>Personnel:</strong> {crew.crewSize} Staff</span>
                        <span><strong>Equipment:</strong> {crew.equipment}</span>
                        <span className="text-slate-600">📞 {crew.contact}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4"/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: CUSTOM CREW / CONTRACTOR OVERRIDE */}
          <div className="pt-2">
            <label 
              onClick={() => setSelectedType('CUSTOM')}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 cursor-pointer"
            >
              <input 
                type="radio" 
                checked={selectedType === 'CUSTOM'} 
                onChange={() => setSelectedType('CUSTOM')} 
                className="text-emerald-600 focus:ring-emerald-500"
              />
              3. Assign Custom Field Officer or Empanelled Contractor
            </label>
            {selectedType === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Officer / Contractor Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Er. K. C. Mohapatra"
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Operational Role / Vehicle Reg</label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Empanelled Road Works Contractor"
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Assigned personnel will receive instant automated SMS & dispatch alert.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4"/>
              Confirm & Deploy Team
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssignFieldTeamModal;
