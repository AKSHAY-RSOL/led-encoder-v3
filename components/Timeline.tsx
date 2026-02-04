
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Cue, SuitConfig } from '../types';
import { Play, Pause, Rewind, Plus, Music, ChevronRight, ChevronDown, Layers, Gauge, SkipForward } from 'lucide-react';

interface TimelineProps {
  cues: Cue[];
  suits: SuitConfig[];
  currentTime: number;
  duration: number;
  zoom: number; // pixels per second
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  onSelectCue: (id: string) => void;
  selectedCueId: string | null;
  onAddCue: (suitId: number, time: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  nudgeStep: number;
  onNudgeStepChange: (step: number) => void;
}

// Separate component for the heavy track logic.
// This component only re-renders when cues/structure change, NOT when currentTime changes.
const TimelineTracks = React.memo((props: {
    cues: Cue[];
    suits: SuitConfig[];
    duration: number;
    zoom: number;
    selectedCueId: string | null;
    expandedSuits: Set<number>;
    toggleExpand: (id: number) => void;
    onSelectCue: (id: string) => void;
    onAddCue: (suitId: number, time: number) => void;
}) => {
    const { cues, suits, duration, zoom, selectedCueId, expandedSuits, toggleExpand, onSelectCue, onAddCue } = props;

    // Helper to calculate lanes
    const getLaneData = (suitCues: Cue[]) => {
        const sorted = [...suitCues].sort((a, b) => a.startTime - b.startTime);
        const lanes: { endTime: number }[] = [];
        const mapping: Record<string, number> = {};

        sorted.forEach(cue => {
            let placed = false;
            for (let i = 0; i < lanes.length; i++) {
                if (lanes[i].endTime <= cue.startTime) {
                    lanes[i].endTime = cue.startTime + cue.duration;
                    mapping[cue.id] = i;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                lanes.push({ endTime: cue.startTime + cue.duration });
                mapping[cue.id] = lanes.length - 1;
            }
        });
        return { count: lanes.length, mapping };
    };

    return (
        <div 
             style={{ width: Math.max(1000, (duration / 1000) * zoom + 160), minHeight: '100%' }}
             className="relative"
        >
            {/* Ruler Marks (Static part) */}
            <div className="h-8 bg-[#2a2a2a] border-b border-neutral-700 flex items-end sticky top-0 z-40">
                <div className="w-40 flex-shrink-0 bg-[#252525] h-full border-r border-neutral-700 flex items-center px-2 text-xs text-neutral-500 z-50 sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                    TIMELINE
                </div>
                {Array.from({ length: Math.ceil(duration / 1000) }).map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute bottom-0 text-[10px] text-neutral-500 border-l border-neutral-600 pl-1 h-4 select-none pointer-events-none"
                        style={{ left: 160 + i * zoom }}
                    >
                        {i}s
                    </div>
                ))}
            </div>

            {/* Tracks */}
            {suits.map((suit) => {
                const suitCues = cues.filter(c => c.suitId === suit.id);
                const isExpanded = expandedSuits.has(suit.id);
                const { count: laneCount, mapping: laneMapping } = getLaneData(suitCues);
                
                const expandedHeight = Math.max(64, laneCount * 34 + 20);
                const currentHeight = isExpanded ? expandedHeight : 64;
                const hasOverlaps = laneCount > 1;

                return (
                    <div 
                        key={suit.id} 
                        className="border-b border-neutral-800 flex relative group transition-[height] duration-200 ease-in-out"
                        style={{ height: currentHeight }}
                        // Mouse down handled by parent via bubbling or distinct handlers
                    >
                        {/* Track Header */}
                        <div 
                            className="w-40 flex-shrink-0 bg-[#222] border-r border-neutral-700 flex flex-col justify-center px-3 sticky left-0 z-40 group-hover:bg-[#2a2a2a] transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.3)] cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(suit.id);
                            }}
                        >
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-xs font-bold text-neutral-300 truncate pr-2 flex items-center gap-1">
                                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    {suit.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddCue(suit.id, 0); // Placeholder time, will rely on click pos
                                    }}
                                    className="text-neutral-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-neutral-600">
                                <span>{suit.ledCount} LEDs</span>
                                {hasOverlaps && (
                                    <span className="flex items-center gap-1 text-amber-500/70">
                                        <Layers size={10} />
                                        {laneCount} layers
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none z-0" 
                             style={{ 
                                 backgroundImage: `linear-gradient(to right, #2a2a2a 1px, transparent 1px)`,
                                 backgroundSize: `${zoom}px 100%`,
                                 left: 160
                             }} 
                        />

                        {/* Cues */}
                        {suitCues.map(cue => {
                            const laneIndex = laneMapping[cue.id] || 0;
                            const top = isExpanded ? 10 + (laneIndex * 34) : 12;
                            const height = isExpanded ? 28 : 40;
                            
                            return (
                                <div
                                    key={cue.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectCue(cue.id);
                                    }}
                                    className={`absolute rounded-md cursor-pointer overflow-hidden border transition-all ${
                                        selectedCueId === cue.id 
                                        ? 'border-white ring-1 ring-cyan-500 z-30 shadow-lg shadow-cyan-900/50' 
                                        : 'border-transparent opacity-90 hover:opacity-100 hover:border-neutral-400 z-10 hover:z-20'
                                    }`}
                                    style={{
                                        left: 160 + (cue.startTime / 1000) * zoom,
                                        width: (cue.duration / 1000) * zoom,
                                        backgroundColor: cue.color,
                                        top: top,
                                        height: height,
                                    }}
                                >
                                    <div className="w-full h-full bg-black/20 px-2 flex items-center">
                                        <span className="text-[10px] font-bold text-white drop-shadow-md truncate">
                                            {cue.type.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
});

// Helper component for manual time entry
const TimeDisplay = ({ currentTime, onTimeChange }: { currentTime: number, onTimeChange: (t: number) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const mils = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${mils.toString().padStart(2, '0')}`;
    };

    const handleClick = () => {
        setInputValue(formatTime(currentTime));
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const handleBlur = () => {
        parseAndSubmit(inputValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            parseAndSubmit(inputValue);
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const parseAndSubmit = (val: string) => {
        let ms = currentTime;
        if (val.includes(':')) {
            const parts = val.split(':');
            const m = parseFloat(parts[0]) || 0;
            const s = parseFloat(parts[1]) || 0;
            ms = (m * 60 + s) * 1000;
        } else {
            const num = parseFloat(val);
            if (!isNaN(num)) {
                ms = num * 1000;
            }
        }
        onTimeChange(ms);
    };

    if (isEditing) {
        return (
            <input 
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="font-mono text-cyan-400 text-lg mx-4 w-24 bg-neutral-800 border border-cyan-500 rounded px-1 outline-none text-center"
            />
        );
    }

    return (
        <div 
            onClick={handleClick}
            className="font-mono text-cyan-400 text-lg mx-4 w-24 cursor-pointer hover:bg-neutral-800 rounded px-1 text-center border border-transparent hover:border-neutral-700 transition-colors"
            title="Click to enter time manually"
        >
            {formatTime(currentTime)}
        </div>
    );
}

const Timeline: React.FC<TimelineProps> = ({
  cues,
  suits,
  currentTime,
  duration,
  zoom,
  isPlaying,
  onTimeChange,
  onTogglePlay,
  onSelectCue,
  selectedCueId,
  onAddCue,
  playbackRate,
  onPlaybackRateChange,
  nudgeStep,
  onNudgeStepChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedSuits, setExpandedSuits] = useState<Set<number>>(new Set());
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Auto-scroll timeline when playing
  useEffect(() => {
    if (isPlaying && containerRef.current) {
        const playheadPos = (currentTime / 1000) * zoom;
        const containerWidth = containerRef.current.clientWidth;
        const scrollLeft = containerRef.current.scrollLeft;
        
        if (playheadPos > scrollLeft + containerWidth - 50) {
            containerRef.current.scrollLeft = playheadPos - 50;
        }
    }
  }, [currentTime, isPlaying, zoom]);

  const toggleExpand = (suitId: number) => {
    setExpandedSuits(prev => {
        const next = new Set(prev);
        if (next.has(suitId)) {
            next.delete(suitId);
        } else {
            next.add(suitId);
        }
        return next;
    });
  };

  const handleTimelineInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + containerRef.current.scrollLeft;
      const timeX = x - 160;
      
      if (timeX < 0) return; // Clicked on sidebar
      
      const clickedTime = (timeX / zoom) * 1000;
      
      if (!e.shiftKey) {
          onTimeChange(clickedTime);
      }
  };

  const nudge = (amount: number) => {
      onTimeChange(currentTime + amount);
      // Update the active step for keyboard use
      onNudgeStepChange(Math.abs(amount));
  }

  const getNudgeButtonClass = (amount: number) => {
      const isActive = nudgeStep === amount;
      return `px-1.5 py-1 text-[10px] font-mono font-medium rounded transition-colors ${
          isActive 
            ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-600/50' 
            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700'
      }`;
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-neutral-700 select-none">
      {/* Toolbar */}
      <div className="h-10 flex items-center px-4 bg-[#252525] border-b border-neutral-800 space-x-2 shrink-0 z-50">
        <button onClick={onTogglePlay} className="text-cyan-400 hover:text-white transition-colors p-1" title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={() => onTimeChange(0)} className="text-neutral-400 hover:text-white p-1" title="Rewind to Start">
            <Rewind size={18} />
        </button>
        
        {/* Nudge Controls */}
        <div className="flex items-center gap-1 mx-2 border-l border-r border-neutral-700 px-3">
             {/* Negative */}
            <button 
                onClick={() => nudge(-1000)} 
                className={getNudgeButtonClass(1000)}
                title="Back 1s (Selects 1s step)"
            >
                -1s
            </button>
            <button 
                onClick={() => nudge(-100)} 
                className={getNudgeButtonClass(100)}
                title="Back 100ms (Selects 100ms step)"
            >
                -100ms
            </button>
            <button 
                onClick={() => nudge(-10)} 
                className={getNudgeButtonClass(10)}
                title="Back 10ms (Selects 10ms step)"
            >
                -10ms
            </button>
            
            <div className="w-px h-4 bg-neutral-700 mx-1"></div>

            {/* Positive */}
            <button 
                onClick={() => nudge(10)} 
                className={getNudgeButtonClass(10)}
                title="Forward 10ms (Selects 10ms step)"
            >
                +10ms
            </button>
            <button 
                onClick={() => nudge(100)} 
                className={getNudgeButtonClass(100)}
                title="Forward 100ms (Selects 100ms step)"
            >
                +100ms
            </button>
            <button 
                onClick={() => nudge(1000)} 
                className={getNudgeButtonClass(1000)}
                title="Forward 1s (Selects 1s step)"
            >
                +1s
            </button>
        </div>

        {/* Speed Control */}
        <div className="relative">
            <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white bg-neutral-800 px-2 py-1 rounded border border-neutral-700"
                title="Playback Speed"
            >
                <Gauge size={12} />
                <span className="w-8 text-center">{playbackRate}x</span>
            </button>
            
            {showSpeedMenu && (
                <div className="absolute bottom-8 left-0 bg-[#222] border border-neutral-700 rounded shadow-xl flex flex-col p-1 min-w-[80px]">
                    {[1.0, 0.75, 0.5, 0.25, 0.1].map(rate => (
                        <button
                            key={rate}
                            onClick={() => {
                                onPlaybackRateChange(rate);
                                setShowSpeedMenu(false);
                            }}
                            className={`text-xs text-left px-2 py-1.5 rounded hover:bg-neutral-700 ${playbackRate === rate ? 'text-cyan-400 font-bold' : 'text-neutral-400'}`}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>
            )}
        </div>
        
        {/* Manual Time Entry */}
        <TimeDisplay currentTime={currentTime} onTimeChange={onTimeChange} />
        
        <div className="flex-1"></div>
        
        <div className="text-xs text-neutral-500 flex items-center gap-2">
            <Music size={14} />
            <span>NO AUDIO LOADED</span>
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative custom-scrollbar"
        style={{ scrollBehavior: 'auto' }}
        onClick={handleTimelineInteraction}
        onDoubleClick={(e) => {
             handleTimelineInteraction(e);
        }}
      >
         {/* Memoized Tracks */}
         <TimelineTracks 
            cues={cues}
            suits={suits}
            duration={duration}
            zoom={zoom}
            selectedCueId={selectedCueId}
            expandedSuits={expandedSuits}
            toggleExpand={toggleExpand}
            onSelectCue={onSelectCue}
            onAddCue={(suitId, time) => {
                onAddCue(suitId, time || currentTime);
            }}
         />

         {/* Playhead Overlay */}
         <div 
             className="absolute top-0 bottom-0 w-px bg-cyan-400 z-50 pointer-events-none"
             style={{ 
                 left: 160 + (currentTime / 1000) * zoom,
                 height: '100%' 
             }}
         >
             <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-cyan-400 -ml-[4.5px] sticky top-0"></div>
         </div>
      </div>
      
      <div className="h-6 bg-[#1a1a1a] flex items-center justify-end px-2 text-[10px] text-neutral-500 border-t border-neutral-800 shrink-0">
         DOUBLE CLICK TRACK TO ADD • CLICK HEADER TO EXPAND LAYERS • ARROW KEYS TO NUDGE • DELETE KEY TO REMOVE
      </div>
    </div>
  );
};

export default Timeline;
