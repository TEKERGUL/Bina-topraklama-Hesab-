/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResult } from '../types';
import { FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePDFReport } from '../lib/pdfGenerator';

interface PropertyPanelProps {
  results: CalculationResult | null;
  buildingInfo: {
    type: string;
    area: number;
    perimeter: number;
  };
  rho: number;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ results, buildingInfo, rho }) => {
  const handleGeneratePDF = async () => {
    if (results) {
      await generatePDFReport({ ...results, rho }, buildingInfo);
    }
  };

  return (
    <aside className="w-[280px] flex flex-col h-full bg-[#0B0D12]/95 backdrop-blur-xl border-l border-white/[0.05] overflow-y-auto shrink-0 scrollbar-hide shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-20">
      <div className="p-5 flex flex-col h-full space-y-6">
        <div>
          <h2 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest border-b border-white/[0.05] pb-2 mb-4 drop-shadow-sm">Analiz Özetleri</h2>
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className="flex justify-between text-[10px] items-center p-1.5 rounded hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-500 font-medium">Temel/İç Uzunluk:</span>
                  <span className="font-mono text-slate-300">{(buildingInfo.perimeter + results.internalLength).toFixed(1)} m</span>
                </div>
                <div className="flex justify-between text-[10px] items-center p-1.5 rounded hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-500 font-medium">Temel Direnci:</span>
                  <span className="font-mono text-slate-300">{results.baseResistance} Ω</span>
                </div>
                <div className="flex justify-between text-[10px] items-center p-1.5 rounded hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-500 font-medium">Çevre Direnci:</span>
                  <span className="font-mono text-slate-300">{results.ringResistance} Ω</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold border-t border-white/[0.05] pt-3 mt-3 px-1.5">
                  <span className="text-slate-400 uppercase tracking-wider">Eşdeğer Toplam:</span>
                  <span className={`font-mono drop-shadow-md ${results.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>{results.totalResistance} Ω</span>
                </div>
              </motion.div>
            ) : (
              <p className="text-[10px] text-slate-500 italic bg-white/[0.02] p-3 rounded border border-white/[0.02]">Analiz bekleniyor...</p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 flex flex-col">
          <h2 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest border-b border-white/[0.05] pb-2 mb-4 drop-shadow-sm">Malzeme Listesi (BOQ)</h2>
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                <div className="space-y-4 mb-6 flex-1 pr-1">
                  {results.equipment.map((item, idx) => (
                    <div key={idx} className="group p-2 rounded-lg bg-white/[0.01] border border-white/[0.02] hover:bg-blue-900/10 hover:border-blue-500/20 transition-all">
                      <div className="flex justify-between items-start text-[10px] mb-1.5 leading-tight">
                        <span className="text-slate-300 group-hover:text-blue-100 transition-colors uppercase font-bold tracking-tight">{item.name}</span>
                        <span className="font-mono text-blue-400 font-bold whitespace-nowrap ml-2 bg-blue-950/50 px-1.5 py-0.5 rounded">{item.quantity} {item.unit}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 group-hover:text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-5 border-t border-white/[0.05]">
                  <button 
                    onClick={handleGeneratePDF}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white font-bold py-3.5 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.6)] active:scale-[0.98] flex items-center justify-center gap-2 border border-blue-400/20"
                  >
                    <FileText size={16} className="drop-shadow-sm" /> DETAYLI PDF RAPORU <ChevronRight size={14} className="opacity-70" />
                  </button>
                  <p className="text-[8px] text-slate-600 text-center mt-3 uppercase tracking-widest font-mono">© 2026 TERRA-CALC PRO ENGINE</p>
                </div>
              </motion.div>
            ) : (
               <p className="text-[10px] text-slate-500 italic bg-white/[0.02] p-3 rounded border border-white/[0.02]">Henüz bir veri oluşturulmadı.</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

export default PropertyPanel;
