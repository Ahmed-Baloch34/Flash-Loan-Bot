import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Fuel, Zap, Calculator } from 'lucide-react';

const GasTracker = () => {
  const [gasPrice, setGasPrice] = useState(null);
  const [estCost, setEstCost] = useState(null);

  useEffect(() => {
    // Real Mainnet Provider for Gas Data
    const provider = new ethers.JsonRpcProvider("https://ethereum.publicnode.com");

    const fetchGas = async () => {
      try {
        const feeData = await provider.getFeeData();
        const gwei = ethers.formatUnits(feeData.gasPrice, "gwei");
        
        // Assume Flash Loan takes ~180,000 Gas units
        const costEth = ethers.formatEther(feeData.gasPrice * 180000n);
        const ethPrice = 2250; // Hardcoded for demo (or fetch dynamic)
        const costUsd = (parseFloat(costEth) * ethPrice).toFixed(2);

        setGasPrice(parseFloat(gwei).toFixed(0));
        setEstCost(costUsd);
      } catch (err) {
        console.error("Gas Error", err);
      }
    };

    fetchGas();
    const interval = setInterval(fetchGas, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      
      {/* Gas Price Card */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-orange-500/50 transition-all">
        <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Fuel size={10} /> Network Gas (Gwei)
            </div>
            <div className="text-xl font-mono font-bold text-orange-400 flex items-center gap-2">
                {gasPrice || "--"} <span className="text-xs text-gray-500 font-sans">Low</span>
            </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
            <Zap size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Est. Cost Card */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
        <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calculator size={10} /> Est. Tx Cost
            </div>
            <div className="text-xl font-mono font-bold text-blue-400 flex items-center gap-2">
                ${estCost || "--"} <span className="text-xs text-gray-500 font-sans">USD</span>
            </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
            <span className="text-xs font-bold text-blue-500">TX</span>
        </div>
      </div>

    </div>
  );
};

export default GasTracker;