/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Text, Arrow } from 'react-konva';
import { Point } from '../types';

interface DrawingCanvasProps {
  onShapeChange: (area: number, perimeter: number, internalLength: number, cornerCount: number) => void;
  pixelToMeter: number;
  rodCount: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onShapeChange, pixelToMeter, rodCount }) => {
  const [mainPath, setMainPath] = useState<Point[]>([]);
  const [internalPaths, setInternalPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isMainFinished, setIsMainFinished] = useState(false);
  
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [manualLength, setManualLength] = useState<string>('');
  const [showInput, setShowInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentPath.length > 0) {
          if (!isMainFinished) {
            setCurrentPath([]);
          } else {
            if (currentPath.length > 1) {
              setInternalPaths(prev => [...prev, currentPath]);
            }
            setCurrentPath([]);
          }
        }
        setShowInput(false);
      }
      // Allow triggering manual input with a shortcut like 'm' or just digits
      if (!showInput && /^\d$/.test(e.key) && currentPath.length > 0) {
        setShowInput(true);
        setManualLength(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [currentPath, isMainFinished, showInput]);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const snap = (v: number) => Math.round(v / 20) * 20;

  const handleContentClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    
    const snapped = { x: snap(pointerPos.x), y: snap(pointerPos.y) };

    // Stop if clicking input
    if (showInput) return;

    // Check if closing main
    if (!isMainFinished && currentPath.length > 2) {
      const dist = Math.sqrt(Math.pow(snapped.x - currentPath[0].x, 2) + Math.pow(snapped.y - currentPath[0].y, 2));
      if (dist < 25) {
        const closedPath = [...currentPath, currentPath[0]];
        setMainPath(closedPath);
        setIsMainFinished(true);
        setCurrentPath([]);
        calculateCombined(closedPath, internalPaths);
        return;
      }
    }

    if (currentPath.length > 0) {
      // If we already have points, every click should open the manual input
      // to ensure the user provides a distance in the direction they clicked
      setShowInput(true);
    } else {
      // First point of a new path is always a direct click
      const nextPath = [snapped];
      setCurrentPath(nextPath);
      if (isMainFinished) {
        calculateCombined(mainPath, [...internalPaths, nextPath]);
      }
    }
  };

  const handleManualInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const length = parseFloat(manualLength);
    if (isNaN(length) || length <= 0 || !mousePos || currentPath.length === 0) {
      setShowInput(false);
      setManualLength('');
      return;
    }

    const last = currentPath[currentPath.length - 1];
    const dx = mousePos.x - last.x;
    const dy = mousePos.y - last.y;
    const angle = Math.atan2(dy, dx);
    const lengthInPixels = length / pixelToMeter;

    const nextPoint = {
      x: snap(last.x + Math.cos(angle) * lengthInPixels),
      y: snap(last.y + Math.sin(angle) * lengthInPixels)
    };

    const newPath = [...currentPath, nextPoint];
    setCurrentPath(newPath);
    setShowInput(false);
    setManualLength('');
    
    if (isMainFinished) {
      calculateCombined(mainPath, [...internalPaths, newPath]);
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (pointerPosition) {
      setMousePos({ x: snap(pointerPosition.x), y: snap(pointerPosition.y) });
    }
  };

  const calculateCombined = (main: Point[], internals: Point[][]) => {
    // Area / Perimeter of main
    let area = 0;
    let perimeter = 0;
    let corners = 0;

    if (main.length > 2) {
      corners += main.length - 1; // Closed shape corners
      for (let i = 0; i < main.length - 1; i++) {
        const p1 = main[i];
        const p2 = main[i+1];
        area += (p1.x * p2.y) - (p2.x * p1.y);
        perimeter += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * pixelToMeter;
      }
      area = Math.abs(area / 2) * Math.pow(pixelToMeter, 2);
    }

    // Length of internals
    let internalLength = 0;
    internals.forEach(path => {
      corners += path.length;
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i+1];
        internalLength += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * pixelToMeter;
      }
    });

    onShapeChange(area, perimeter, internalLength, corners);
  };

  const resetDrawing = () => {
    setMainPath([]);
    setInternalPaths([]);
    setCurrentPath([]);
    setIsMainFinished(false);
    onShapeChange(0, 0, 0, 0);
    setShowInput(false);
  };

  const getOffsetPolygon = (rawPts: Point[], offset: number) => {
    if (rawPts.length < 3) return [];

    // Strip duplicate end point if the path is closed, otherwise normalizing 0-len vector collapses the corner
    const pts = (rawPts.length > 3 &&
        Math.abs(rawPts[0].x - rawPts[rawPts.length - 1].x) < 0.1 &&
        Math.abs(rawPts[0].y - rawPts[rawPts.length - 1].y) < 0.1)
        ? rawPts.slice(0, -1) : rawPts;

    if (pts.length < 3) return [];

    // Calculate signed area to determine orientation
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        area += (p1.x * p2.y - p2.x * p1.y);
    }
    // Screen coordinates: +Y is down.
    // Positive area = CLOCKWISE. Negative area = COUNTER-CLOCKWISE.
    const sign = area > 0 ? -1 : 1;

    const offsetPts: number[] = [];
    for (let i = 0; i < pts.length; i++) {
        const pPrev = pts[(i - 1 + pts.length) % pts.length];
        const pCurr = pts[i];
        const pNext = pts[(i + 1) % pts.length];

        const v1x = pCurr.x - pPrev.x;
        const v1y = pCurr.y - pPrev.y;
        const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const n1x = (-v1y / (len1 || 1)) * sign;
        const n1y = (v1x / (len1 || 1)) * sign;

        const v2x = pNext.x - pCurr.x;
        const v2y = pNext.y - pCurr.y;
        const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
        const n2x = (-v2y / (len2 || 1)) * sign;
        const n2y = (v2x / (len2 || 1)) * sign;

        let nx = n1x + n2x;
        let ny = n1y + n2y;
        const lenN = Math.sqrt(nx * nx + ny * ny);

        if (lenN < 0.0001) {
            nx = n1x;
            ny = n1y;
        } else {
            nx /= lenN;
            ny /= lenN;
            const dot = nx * n1x + ny * n1y;
            if (Math.abs(dot) > 0.1) {
                nx /= dot;
                ny /= dot;
            } else {
                nx /= (0.1 * Math.sign(dot) || 1);
                ny /= (0.1 * Math.sign(dot) || 1);
            }
        }

        offsetPts.push(pCurr.x + nx * offset, pCurr.y + ny * offset);
    }
    
    // Close the polygon for Konva (append the first point at the end)
    offsetPts.push(offsetPts[0], offsetPts[1]);
    return offsetPts;
  };

  const getDistributedRods = (ringFlatCoords: number[], numRods: number) => {
    if (numRods === 0 || ringFlatCoords.length < 6) return [];
    
    // Convert flat array back to points (ignoring the last duplicate closing point)
    const rPts: Point[] = [];
    for(let i = 0; i < ringFlatCoords.length - 2; i += 2) {
        rPts.push({ x: ringFlatCoords[i], y: ringFlatCoords[i+1] });
    }
    
    const M = rPts.length;
    const rods: Point[] = [];

    // 1. Put rods on the corners first (up to numRods or total corners)
    const cornersToPlace = Math.min(numRods, M);
    for(let i = 0; i < cornersToPlace; i++) {
        rods.push(rPts[i]);
    }

    // 2. Distribute remaining rods along the edges
    const remaining = numRods - cornersToPlace;
    if (remaining > 0) {
        // Find segment lengths
        const edges = rPts.map((p, i) => {
            const next = rPts[(i + 1) % M];
            const len = Math.hypot(next.x - p.x, next.y - p.y);
            return { p1: p, p2: next, len, count: 0 };
        });

        // Distribute proportionally to edge length using greatest quotient
        for(let i = 0; i < remaining; i++) {
            edges.sort((a, b) => (b.len / (b.count + 1)) - (a.len / (a.count + 1)));
            edges[0].count++;
        }

        // Place them on the calculated segments
        edges.forEach(edge => {
            for(let c = 1; c <= edge.count; c++) {
                const ratio = c / (edge.count + 1);
                rods.push({
                    x: edge.p1.x + (edge.p2.x - edge.p1.x) * ratio,
                    y: edge.p1.y + (edge.p2.y - edge.p1.y) * ratio
                });
            }
        });
    }

    return rods;
  };

  const mainDrawPoints = mainPath.flatMap(p => [p.x, p.y]);
  const ringPoints = getOffsetPolygon(mainPath, 30); // 30px offset = 3m
  const currentDrawPoints = currentPath.flatMap(p => [p.x, p.y]);
  const distributedRods = isMainFinished ? getDistributedRods(ringPoints, rodCount) : [];

  return (
    <div 
      ref={containerRef} 
      id="cad-canvas-container" 
      className="absolute inset-0 cad-grid touch-none select-none cursor-crosshair"
      onWheel={(e) => e.preventDefault()}
    >
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-3 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto filter drop-shadow-md">
          <button onClick={resetDrawing} className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/[0.05] text-[10px] text-slate-300 font-bold uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-95">SIFIRLA</button>
          {!showInput && currentPath.length > 0 && (
            <button 
              onClick={() => setShowInput(true)} 
              className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-[10px] text-white font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all shadow-[0_4px_15px_rgba(37,99,235,0.4)] active:scale-95"
            >
              METRAJ GİR (M)
            </button>
          )}
          <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/[0.05] text-[10px] font-mono text-cyan-400 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center">ÖLÇEK: 10px = 1m</div>
        </div>
        <div className="flex flex-col gap-1.5 pointer-events-none drop-shadow-sm">
          <div className="text-[9px] text-white font-bold uppercase tracking-widest bg-blue-900/60 backdrop-blur-sm border border-blue-500/30 px-3 py-1.5 rounded inline-block shadow-lg">
            {!isMainFinished ? "MOD: BİNA DIŞ HATTI ÇİZİMİ" : "MOD: İÇ HAT / KOLON ÇİZİMİ"}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-widest bg-black/40 backdrop-blur-sm p-1.5 rounded inline-block border border-white/[0.02]">
            {!isMainFinished ? "Başa tıklayarak kapatın | Nokta için tıklayın" : "Bitirmek için ESC | Yeni hat için tıkla"}
          </div>
        </div>
      </div>

      {showInput && (
        <div className="fixed z-[100] bg-[#0A0C10]/95 p-5 border border-blue-500/40 rounded-2xl shadow-[0_0_50px_-15px_rgba(59,130,246,0.6)] top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 backdrop-blur-xl ring-1 ring-white/10">
          <form onSubmit={handleManualInputSubmit}>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest drop-shadow-sm">Mesafe (Metre)</label>
              <button type="button" onClick={() => setShowInput(false)} className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">×</button>
            </div>
            <input 
              ref={inputRef}
              type="text" 
              inputMode="decimal"
              value={manualLength} 
              onChange={e => setManualLength(e.target.value)}
              className="w-full bg-black border border-white/[0.05] rounded-xl p-4 text-white font-mono text-3xl outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner text-center block"
              placeholder="0.00"
            />
            <div className="mt-4 text-[9px] text-slate-400 leading-tight tracking-wide text-center">
              Fare ile yönü gösterin ve <span className="text-blue-400 font-bold uppercase">ENTER</span> tuşuna basın.
            </div>
          </form>
        </div>
      )}

      <Stage width={dimensions.width} height={dimensions.height} onClick={handleContentClick} onMouseMove={handleMouseMove}>
        <Layer>
          {/* Outer Ring */}
          {mainPath.length > 2 && (
            <Line points={ringPoints} stroke="#F6AD55" strokeWidth={1} dash={[10, 5]} closed opacity={0.6} listening={false} />
          )}

          {/* Main Building */}
          {mainPath.length > 0 && (
            <Line points={mainDrawPoints} stroke="#00F2FF" strokeWidth={2.5} lineCap="round" lineJoin="round" opacity={0.9} listening={false} />
          )}

          {/* Internal Paths */}
          {internalPaths.map((path, idx) => (
            <Line key={idx} points={path.flatMap(p => [p.x, p.y])} stroke="#A0AEC0" strokeWidth={1.5} lineCap="round" opacity={0.7} listening={false} />
          ))}

          {/* Current Path */}
          <Line points={currentDrawPoints} stroke={isMainFinished ? "#A0AEC0" : "#00F2FF"} strokeWidth={2} lineCap="round" listening={false} />

          {/* Guide Line */}
          {currentPath.length > 0 && mousePos && !showInput && (
            <>
              <Arrow
                points={[currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y, mousePos.x, mousePos.y]}
                pointerLength={8}
                pointerWidth={8}
                fill="#4FD1C5"
                stroke="#4DB6AC"
                strokeWidth={1}
                dash={[5, 2]}
                listening={false}
              />
              <Text 
                x={mousePos.x + 10} 
                y={mousePos.y + 10} 
                text={`${(Math.sqrt(Math.pow(mousePos.x - currentPath[currentPath.length-1].x, 2) + Math.pow(mousePos.y - currentPath[currentPath.length-1].y, 2)) * pixelToMeter).toFixed(2)}m`}
                fill="#4FD1C5"
                fontSize={10}
                fontFamily="monospace"
                listening={false}
              />
            </>
          )}

          {/* Main Path Corners */}
          {mainPath.map((p, i) => (
            <Circle key={`m-${i}`} x={p.x} y={p.y} radius={2} fill="#F6AD55" listening={false} />
          ))}

          {/* Distributed Grounding Rods (Kazıklar) */}
          {distributedRods.map((p, i) => (
            <Circle 
              key={`rod-${i}`} 
              x={p.x} 
              y={p.y} 
              radius={4} 
              fill="#EF4444" 
              stroke="#7F1D1D" 
              strokeWidth={1.5} 
              shadowColor="#EF4444" 
              shadowBlur={8}
              listening={false} 
            />
          ))}

          {/* Internal Path Corners */}
          {internalPaths.flat().map((p, i) => (
            <Circle key={`int-${i}`} x={p.x} y={p.y} radius={2} fill="#CBD5E0" listening={false} />
          ))}

          {/* Current Path Corners */}
          {currentPath.map((p, i) => (
            <Circle key={`c-${i}`} x={p.x} y={p.y} radius={3} fill={isMainFinished ? "#CBD5E0" : "#00F2FF"} listening={false} />
          ))}
          
          {/* Closing Helper */}
          {!isMainFinished && currentPath.length > 2 && (
             <Circle x={currentPath[0].x} y={currentPath[0].y} radius={12} stroke="#48BB78" strokeWidth={1} dash={[4, 4]} listening={false} />
          )}

          {/* Labels */}
          {isMainFinished && (
            <>
               <Text x={mainPath[0].x} y={mainPath[0].y - 30} text="İŞLETME/TEMEL" fill="#00F2FF" fontSize={9} fontStyle="bold" />
               <Text x={mainPath[0].x} y={mainPath[0].y - 45} text="ÇEVRE/KORUMA" fill="#F6AD55" fontSize={9} fontStyle="bold" />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;
