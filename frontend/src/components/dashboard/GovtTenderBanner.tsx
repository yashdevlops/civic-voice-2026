'use client';

import React from 'react';
import Link from 'next/link';
import { Gavel, ArrowRight } from 'lucide-react';
import { useContractsStore } from '@/lib/contractsStore';

export const GovtTenderBanner: React.FC = () => {
  const { tenders } = useContractsStore();
  const activeTenders = (tenders || []).filter(t => t.status === 'OPEN_FOR_BIDDING');

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl p-5 mb-6 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
          <Gavel className="w-6 h-6"/>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white font-display">BMC E-Procurement & Contract Bidding</h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
              {activeTenders.length} Active Tenders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Civil road works, water trunk lines, smart electricals & bio-mining contracts open for on-site physical bidding.
          </p>
        </div>
      </div>

      <Link className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 shrink-0 cursor-pointer" href="/contracts">
        <span>Access Tender Portal</span>
        <ArrowRight className="w-3.5 h-3.5"/>
      </Link>
    </div>
  );
};

export default GovtTenderBanner;
