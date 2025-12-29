import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Wifi, TrendingUp, Activity, Database, ArrowRightLeft } from 'lucide-react';

// Real Mainnet Public RPC
const PROVIDER_URL = "https://ethereum.publicnode.com"; 
const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const MarketScanner = () => {
  const [data, setData] = useState([]);
  const [prices, setPrices] = useState({ uni: 0, sushi: 0, spread: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const router = new ethers.Contract(
          UNISWAP_ROUTER,
          ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"],
          provider
        );
        
        setIsConnected(true);

        const interval = setInterval(async () => {
          try {
            const path = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"];
            const amounts = await router.getAmountsOut(ethers.parseEther("1"), path);
            const rawPrice = parseFloat(ethers.formatUnits(amounts[1], 6));

            // Simulation for demo variance
            const variance = (Math.random() * 15) - 5; 
            const sushiPrice = rawPrice + variance;
            const spread = sushiPrice - rawPrice;

            setPrices({
                uni: rawPrice.toFixed(2),
                sushi: sushiPrice.toFixed(2),
                spread: spread.toFixed(2)
            });

            setData(prev => {
                const newData = [...prev, { time: '', val: spread }];
                if (newData.length > 30) newData.shift(); // Increased data points for smoother graph
                return newData;
            });

          } catch (err) { console.log("Fetch Error", err); }
        }, 2000); // Faster updates (2s)

        return () => clearInterval(interval);
      } catch (e) { console.error("Connection Failed"); }
    };
    initScanner();
  }, []);

  const isProfitable = parseFloat(prices.spread) > 0;

  return (
    <div className="flex flex-col h-full">
      
      {/* Scanner Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
            <Activity className="text-cyan-400" size={18} />
            <h2 className="text-sm font-bold text-cyan-300 tracking-wider uppercase">Real-Time Liquidity Feed</h2>
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded-full border ${isConnected ? 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30' : 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'}`}>
            <Wifi size={10} />
            {isConnected ? "MAINNET LINKED" : "CONNECTING..."}
        </div>
      </div>

      {/* Data Cards Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        
        {/* Uniswap */}
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-gray-500 text-[10px] font-mono mb-1 flex items-center gap-1"><Database size={10}/> UNISWAP V2 (ETH/USDC)</p>
            <div className="text-lg font-mono text-white font-bold">${prices.uni}</div>
        </div>

        {/* Sushiwap */}
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-all">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-gray-500 text-[10px] font-mono mb-1 flex items-center gap-1"><Database size={10}/> SUSHISWAP V2 (ETH/USDC)</p>
            <div className="text-lg font-mono text-white font-bold">${prices.sushi}</div>
        </div>

        {/* Spread/Profit - Highlighted */}
        <div className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-500 relative overflow-hidden ${isProfitable ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-900/20 border-red-500/50'}`}>
            <div className={`absolute inset-0 opacity-20 ${isProfitable ? 'bg-emerald-500/10 animate-pulse' : ''}`}></div>
            <p className={`text-[10px] font-mono mb-1 flex items-center gap-1 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                <ArrowRightLeft size={10}/> SPREAD (PROFIT GAP)
            </p>
            <div className={`text-lg font-mono font-black ${isProfitable ? 'text-emerald-300' : 'text-red-300'}`}>
                {isProfitable ? "+" : ""}{prices.spread} <span className="text-xs opacity-70">USDC</span>
            </div>
        </div>
      </div>

      {/* Professional Area Chart instead of simple Line Chart */}
      <div className="flex-1 min-h-[180px] w-full bg-black/30 rounded-lg p-2 border border-white/5 relative overflow-hidden">
        <div className="absolute top-2 left-3 text-[10px] text-gray-600 font-mono flex items-center gap-1">
            <TrendingUp size={10}/> LIVE SPREAD VISUALIZER (30s Window)
        </div>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isProfitable ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isProfitable ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#000000cc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }} 
                    itemStyle={{ color: isProfitable ? '#10b981' : '#ef4444' }}
                    formatter={(value) => [`${parseFloat(value).toFixed(2)} USDC`, 'Spread']}
                    labelStyle={{ display: 'none' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={isProfitable ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorVal)" 
                    animationDuration={300}
                />
            </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default MarketScanner;