/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import InputPanel from './components/InputPanel';
import PropertyPanel from './components/PropertyPanel';
import { BuildingType, SoilType, SoilResistivity, CalculationResult, RodType, RingMaterial, BaseMaterial } from './types';
import { calculateEarthing } from './lib/calculations';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [buildingType, setBuildingType] = useState<BuildingType>(BuildingType.RESIDENTIAL);
  const [soilType, setSoilType] = useState<SoilType>(SoilType.CLAY);
  const [rodType, setRodType] = useState<RodType>(RodType.BAKIR_1_5);
  const [rodCount, setRodCount] = useState<number>(4);
  const [ringMat, setRingMat] = useState<RingMaterial>(RingMaterial.CU_70);
  const [baseMat, setBaseMat] = useState<BaseMaterial>(BaseMaterial.GALV_30_3_5);
  const [customRho, setCustomRho] = useState<number>(SoilResistivity[SoilType.CLAY]);
  const [drawingData, setDrawingData] = useState<{ area: number; perimeter: number; internalLength: number; cornerCount: number }>({ 
    area: 0, 
    perimeter: 0,
    internalLength: 0,
    cornerCount: 0
  });
  const [results, setResults] = useState<CalculationResult | null>(null);

  useEffect(() => {
    setCustomRho(SoilResistivity[soilType]);
  }, [soilType]);

  const handleShapeChange = (area: number, perimeter: number, internalLength: number, cornerCount: number) => {
    setDrawingData({ area, perimeter, internalLength, cornerCount });
  };

  useEffect(() => {
    if (drawingData.area > 0) {
      const res = calculateEarthing(
        drawingData.area,
        drawingData.perimeter,
        soilType,
        buildingType,
        rodType,
        rodCount,
        ringMat,
        baseMat,
        drawingData.internalLength,
        drawingData.cornerCount,
        customRho
      );
      setResults(res);
      
      if (res.isSafe && (!results || !results.isSafe)) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00F2FF', '#3182CE', '#48BB78']
        });
      }
    } else {
      setResults(null);
    }
  }, [drawingData, soilType, buildingType, customRho, rodType, rodCount, ringMat, baseMat]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#07090D] text-[#E2E8F0] overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/[0.05] flex items-center justify-between px-5 bg-gradient-to-r from-[#0F1219] to-[#161B25] shrink-0 shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center font-bold text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-1 ring-blue-400/30">
            Ω
          </div>
          <h1 className="font-bold text-sm tracking-tight text-white drop-shadow-sm">
            TERRA-CALC <span className="text-blue-400 font-light">PRO</span> 
            <span className="text-[9px] font-mono ml-2 px-1.5 py-0.5 border border-blue-900/50 rounded bg-blue-900/20 text-blue-300">TR-ENG v3.0</span>
          </h1>
        </div>
        <div className="flex gap-4 text-[10px] font-medium items-center">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="tracking-widest">ANALİZ AKTİF: IEEE 80</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <span className="text-slate-400 italic">Proje Tipi: <span className="text-slate-300 not-italic font-semibold">{buildingType}</span></span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex min-h-0 relative">
        {/* Left Sidebar */}
        <div className="relative z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.8)]">
          <InputPanel 
            buildingType={buildingType}
            setBuildingType={setBuildingType}
            soilType={soilType}
            setSoilType={setSoilType}
            rodType={rodType}
            setRodType={setRodType}
            rodCount={rodCount}
            setRodCount={setRodCount}
            ringMat={ringMat}
            setRingMat={setRingMat}
            baseMat={baseMat}
            setBaseMat={setBaseMat}
            customRho={customRho}
            setCustomRho={setCustomRho}
            area={drawingData.area}
            perimeter={drawingData.perimeter}
          />
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0yMCAyMGgyMHYyMEgyMHptLTIwIDBoMjBWMHgtMjB6IiBmaWxsPSIjMEYxMTE1IiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDBNMCAyMGg0ME0yMCAwdjQwTTAgMzBoNDBNMzAgMHY0MCIgc3Ryb2tlPSIjMUExRDIzIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCA0MGg0TXYtNEgwem0zNiAwaDR2LTRoLTR6TTAgNGg0VjBIOHptMzYgMGg0VjBoLTR6IiBmaWxsPSIjMkQzNzQ4Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] bg-repeat relative min-w-0 overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0C10]/80 to-[#12161F]/90 pointer-events-none"></div>
          
          <div className="flex justify-between items-end mb-4 relative z-10 w-full">
             <div>
                <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">CAD Çalışma Alanı</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  Görsel Düzenleyici ve Anlık Metraj
                </p>
             </div>
             {results && (
               <div className={`px-5 py-2.5 rounded-lg border backdrop-blur-md flex items-center gap-4 transition-all shadow-xl shadow-black/40 ${results.isSafe ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-rose-950/40 border-rose-500/50'}`}>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 text-right uppercase font-black tracking-widest">Sistem Direnci</span>
                    <span className={`text-2xl font-mono leading-none tracking-tight filter drop-shadow-md ${results.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>{results.totalResistance} Ω</span>
                  </div>
                  {results.isSafe ? <ShieldCheck size={28} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <ShieldAlert size={28} className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />}
               </div>
             )}
          </div>
          
          <div className="flex-1 relative z-10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/[0.05] bg-black/20">
            <DrawingCanvas 
              onShapeChange={handleShapeChange} 
              pixelToMeter={0.1}
              rodCount={rodCount}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="relative z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.8)] border-l border-white/[0.05]">
          <PropertyPanel 
            results={results} 
            buildingInfo={{
              type: buildingType,
              area: drawingData.area,
              perimeter: drawingData.perimeter
            }}
            rho={customRho}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-8 bg-[#090B0F] border-t border-white/[0.05] flex items-center px-5 justify-between text-[10px] text-slate-400 shrink-0 relative z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span><span className="text-blue-400 font-bold tracking-widest">STATE:</span> CALC_READY</span>
          <span className="text-slate-500">Optimizasyon motoru devrede. Tasarım anlık inceleniyor.</span>
        </div>
        <div className="font-mono flex gap-4 uppercase tracking-wider overflow-hidden whitespace-nowrap ml-4 items-center text-[9px]">
          <span className="text-slate-500">CURSOR: <span className="text-slate-300">CROSSHAIR</span></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500">GRID: <span className="text-slate-300">1m</span></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500">MODE: <span className="text-blue-400 font-bold">2D_PLAN</span></span>
        </div>
      </footer>
    </div>
  );
}
