
import React, { useState } from 'react';
import { Download, X, Clock, User } from 'lucide-react';
import { SuitConfig } from '../types';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (suitId: number | null, timeOffset: number) => void;
    suits: SuitConfig[];
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, suits }) => {
    const [selectedSuitId, setSelectedSuitId] = useState<string>('all');
    const [timeOffset, setTimeOffset] = useState<number>(0);

    if (!isOpen) return null;

    const handleExportClick = () => {
        const suitId = selectedSuitId === 'all' ? null : parseInt(selectedSuitId);
        onExport(suitId, timeOffset);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#222] border border-neutral-700 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-800">
                        <Download size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Export to Arduino</h3>
                        <p className="text-xs text-neutral-400">Generate C++ code for FastLED controllers</p>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Target Selection */}
                    <div>
                        <label className="text-xs font-bold text-neutral-500 mb-2 block flex items-center gap-2">
                            <User size={14} /> TARGET DEVICE
                        </label>
                        <div className="relative">
                            <select 
                                value={selectedSuitId}
                                onChange={(e) => setSelectedSuitId(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none appearance-none"
                            >
                                <option value="all">Export All Suits (Combined)</option>
                                <optgroup label="Individual Dancers">
                                    {suits.map(suit => (
                                        <option key={suit.id} value={suit.id}>
                                            {suit.name} (Standalone)
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <div className="absolute right-3 top-2.5 pointer-events-none text-neutral-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor">
                                    <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
                            {selectedSuitId === 'all' 
                                ? "Generates code to control all suits from a single microcontroller (or multiple linked pins)."
                                : "Generates code specifically for this dancer. The output pin will be mapped to PIN_SUIT_0."}
                        </p>
                    </div>

                    {/* Time Offset */}
                    <div>
                        <label className="text-xs font-bold text-neutral-500 mb-2 block flex items-center gap-2">
                            <Clock size={14} /> TIME OFFSET (SYNC)
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={timeOffset}
                                onChange={(e) => setTimeOffset(Math.max(0, parseInt(e.target.value) || 0))}
                                className="flex-1 bg-neutral-900 border border-neutral-700 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none font-mono"
                            />
                            <span className="text-neutral-500 text-xs font-mono">ms</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
                            Adds a fixed delay to all timestamps. Useful if this code block starts partway through a larger show (Relative Time).
                        </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleExportClick} 
                            className="px-6 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2"
                        >
                            <Download size={16} />
                            Generate Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
