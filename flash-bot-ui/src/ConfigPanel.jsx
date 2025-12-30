import React, { useState } from 'react';
import { Settings, Sliders, Shield, Zap } from 'lucide-react';

const ConfigPanel = () => {
  const [loanAmount, setLoanAmount] = useState(1000);
  const [slippage, setSlippage] = useState(0.5);
  const [autoGas, setAutoGas] = useState(true);

  return (
    <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl mb-6">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
        <Settings size={14} className="text-gray-400" />
        <h3 className="text-gray-200 text-xs font-bold uppercase tracking-widest">Strategy Configuration</h3>
      </div>

      <div className="space-y-5">
        
        {/* Loan Amount Input */}
        <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block flex justify-between">
                <span>Flash Loan Amount (USDC)</span>
                <span className="text-cyan-400 font-mono">${loanAmount.toLocaleString()}</span>
            </label>
            <input 
                type="range" 
                min="100" 
                max="10000" 
                step="100" 
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1">
                <span>$100</span>
                <span>$10,000</span>
            </div>
        </div>

        {/* Slippage Buttons */}
        <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                <Sliders size={10}/> Max Slippage Tolerance
            </label>
            <div className="grid grid-cols-3 gap-2">
                {[0.1, 0.5, 1.0].map((val) => (
                    <button 
                        key={val}
                        onClick={() => setSlippage(val)}
                        className={`text-xs py-1.5 rounded border transition-all font-mono
                        ${slippage === val 
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                            : 'bg-black/20 border-white/10 text-gray-500 hover:bg-white/5'
                        }`}
                    >
                        {val}%
                    </button>
                ))}
            </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
            
            {/* Auto Gas */}
            <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${autoGas ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'}`}>
                        <Zap size={12} />
                    </div>
                    <span className="text-xs text-gray-300">Auto-Gas (Frontrun)</span>
                </div>
                <div 
                    onClick={() => setAutoGas(!autoGas)}
                    className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${autoGas ? 'bg-cyan-600' : 'bg-gray-600'}`}
                >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoGas ? 'left-4.5' : 'left-0.5'}`}></div>
                </div>
            </div>

            {/* Honeypot Check */}
            <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                     <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                        <Shield size={12} />
                    </div>
                    <span className="text-xs text-gray-300">Honeypot Protection</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500">ACTIVE</span>
            </div>

        </div>

      </div>
    </div>
  );
};

export default ConfigPanel;