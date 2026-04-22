/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BuildingType, SoilType, RodType, RingMaterial, BaseMaterial } from '../types';
import { Database, Ruler, Zap, Hammer, Layers } from 'lucide-react';

interface InputPanelProps {
  buildingType: BuildingType;
  setBuildingType: (t: BuildingType) => void;
  soilType: SoilType;
  setSoilType: (s: SoilType) => void;
  rodType: RodType;
  setRodType: (r: RodType) => void;
  rodCount: number;
  setRodCount: (n: number) => void;
  ringMat: RingMaterial;
  setRingMat: (m: RingMaterial) => void;
  baseMat: BaseMaterial;
  setBaseMat: (m: BaseMaterial) => void;
  customRho: number;
  setCustomRho: (r: number) => void;
  area: number;
  perimeter: number;
}

const InputPanel: React.FC<InputPanelProps> = ({
  buildingType, setBuildingType,
  soilType, setSoilType,
  rodType, setRodType,
  rodCount, setRodCount,
  ringMat, setRingMat,
  baseMat, setBaseMat,
  customRho, setCustomRho,
  area, perimeter
}) => {
  return (
    <aside className="w-[300px] flex flex-col h-full bg-[#0B0D12]/95 backdrop-blur-xl border-r border-white/[0.05] overflow-y-auto shrink-0 scrollbar-hide shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-20">
      <div className="p-5 space-y-7 pb-20">
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Database size={16} className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest drop-shadow-sm">Tesis Parametreleri</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1.5 block">Bina / Tesis Tipi</label>
              <select 
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                className="w-full bg-black/40 border border-white/[0.05] rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer shadow-inner"
              >
                {Object.values(BuildingType).map(t => <option key={t} value={t} className="bg-[#0B0D12] text-slate-200">{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1.5 block">Toprak Yapısı</label>
              <select 
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full bg-black/40 border border-white/[0.05] rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer shadow-inner"
              >
                {Object.values(SoilType).map(s => <option key={s} value={s} className="bg-[#0B0D12] text-slate-200">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1.5 block">Özgül Direnç (ρ - Ω.m)</label>
              <input 
                type="number"
                value={customRho}
                onChange={(e) => setCustomRho(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/[0.05] rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner font-mono text-center"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.05] pt-5">
           <div className="flex items-center gap-2 mb-5">
              <Layers size={16} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest drop-shadow-sm">Malzeme Seçimi</h2>
           </div>
           
           <div className="space-y-4">
             <div>
                <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1.5 block">Topraklama Kazık Tipi</label>
                <select 
                  value={rodType}
                  onChange={(e) => setRodType(e.target.value as RodType)}
                  className="w-full bg-black/40 border border-white/[0.05] rounded-lg p-2.5 text-xs text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  {Object.values(RodType).map(r => <option key={r} value={r} className="bg-[#0B0D12] text-slate-200">{r}</option>)}
                </select>
             </div>

             <div>
                <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1.5 block">Kazık Adedi</label>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => setRodCount(Math.max(0, rodCount - 1))}
                    className="w-10 h-10 bg-white/[0.02] border border-white/[0.05] rounded-lg flex items-center justify-center hover:bg-white/[0.05] text-white hover:text-emerald-400 transition-colors shadow-sm active:scale-95"
                   >-</button>
                   <input 
                    type="number"
                    value={rodCount}
                    onChange={(e) => setRodCount(Number(e.target.value))}
                    className="flex-1 w-full bg-black/40 border border-white/[0.05] rounded-lg h-10 text-lg font-bold text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner text-center font-mono"
                   />
                   <button 
                    onClick={() => setRodCount(rodCount + 1)}
                    className="w-10 h-10 bg-white/[0.02] border border-white/[0.05] rounded-lg flex items-center justify-center hover:bg-white/[0.05] text-white hover:text-emerald-400 transition-colors shadow-sm active:scale-95"
                   >+</button>
                </div>
             </div>

             <div className="pt-2">
                <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1.5 block">Çevre Topraklama (Dış)</label>
                <select 
                  value={ringMat}
                  onChange={(e) => setRingMat(e.target.value as RingMaterial)}
                  className="w-full bg-black/40 border border-white/[0.05] rounded-lg p-2.5 text-xs text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  {Object.values(RingMaterial).map(m => <option key={m} value={m} className="bg-[#0B0D12] text-slate-200">{m}</option>)}
                </select>
             </div>

             <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 block">Temel Topraklama (İç)</label>
                <select 
                  value={baseMat}
                  onChange={(e) => setBaseMat(e.target.value as BaseMaterial)}
                  className="w-full bg-black/40 border border-white/[0.05] rounded-lg p-2.5 text-[11px] text-white outline-none focus:border-slate-500/50 focus:ring-1 focus:ring-slate-500/30 transition-all appearance-none cursor-pointer shadow-inner font-mono"
                >
                  {Object.values(BaseMaterial).map(m => <option key={m} value={m} className="bg-[#0B0D12] text-slate-200">{m}</option>)}
                </select>
             </div>
           </div>
        </section>

        <section className="border-t border-white/[0.05] pt-5">
           <div className="flex items-center gap-2 mb-4">
              <Ruler size={14} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest drop-shadow-sm">Geometrik Veriler</h2>
           </div>
           <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-lg border border-white/[0.02] shadow-inner">
             <div className="text-center p-1">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Bina Alanı</p>
                <p className="text-[13px] font-mono font-light text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]">{area.toFixed(1)} <span className="text-[9px] text-slate-500">m²</span></p>
             </div>
             <div className="text-center p-1 border-l border-white/[0.05]">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Bina Çevresi</p>
                <p className="text-[13px] font-mono font-light text-indigo-400 drop-shadow-[0_0_4px_rgba(129,140,248,0.4)]">{perimeter.toFixed(1)} <span className="text-[9px] text-slate-500">m</span></p>
             </div>
           </div>
        </section>
      </div>
    </aside>
  );
};

export default InputPanel;
