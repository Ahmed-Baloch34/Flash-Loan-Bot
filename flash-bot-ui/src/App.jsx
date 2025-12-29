import React, { useState } from 'react';
import MarketScanner from './MarketScanner';
import { ethers } from 'ethers';
import { Activity, Play, Wallet, ShieldCheck, Terminal, Cpu, Zap, Radio, ChevronRight, Lock } from 'lucide-react';
import Background3D from './Background3D'; 
import FlashLoanABI from './FlashLoan.json'; 

// 1. CONFIGURATION
const CONTRACT_ADDRESS = "0xacA80c540a02Cf2a087114944BE8957A130eadE5"; // Aapka deployed contract
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC

function App() {
  const [account, setAccount] = useState(null);
  const [logs, setLogs] = useState(["[SYSTEM] AI Core Initialized...", "[SYSTEM] Waiting for Pilot input..."]);
  const [isRunning, setIsRunning] = useState(false);

  // 2. CONNECT WALLET
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        addLog(`✅ [AUTH] Pilot Identified: ${address.slice(0,6)}...${address.slice(-4)}`);
      } catch (e) { addLog("❌ [ERROR] Access Denied."); }
    } else { alert("MetaMask Needed!"); }
  };

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`, ...prev].slice(0, 50)); // Newest logs on top, keep last 50
  };

  // 3. REAL BOT EXECUTION (BLOCKCHAIN)
  const runBot = async () => {
    if (!account) return alert("Connect Wallet First!");
    
    setIsRunning(true);
    addLog("🚀 [INIT] Engaging Hyper-Speed Arbitrage Protocol...");

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, FlashLoanABI.abi, signer);

        addLog("📡 [NETWORK] Establishing secure channel to Sepolia...");
        addLog("✍️ [WAITING] Awaiting digital signature in wallet...");

        const loanAmount = ethers.parseUnits("1000", 6);
        const tx = await contract.requestFlashLoan(USDC_ADDRESS, loanAmount);
        
        addLog("⏳ [PENDING] Transaction broadcast to mempool...");
        addLog(`🔗 TX Hash: ${tx.hash}`);

        const receipt = await tx.wait();

        if (receipt.status === 1) {
            addLog("✅ [SUCCESS] Flash Loan Cycle Complete!");
            addLog("💰 Arbitrage profit settled to contract wallet.");
        } else {
            addLog("❌ [FAIL] Transaction reverted on-chain.");
        }

    } catch (error) {
        console.error("Bot Error:", error);
        if (error.code === 'ACTION_REJECTED') {
            addLog("❌ [CANCEL] User denied transaction signature.");
        } else {
            addLog("❌ [FAIL] Execution error. Verify contract balance/gas.");
        }
    } finally {
        setIsRunning(false);
    }
  };

  return (
    <div className="relative min-h-screen text-gray-200 overflow-hidden font-mono selection:bg-cyan-500/30 selection:text-white">
      
      {/* 3D BACKGROUND - Made slightly darker for professional feel */}
      <div className="fixed inset-0 bg-black/80 z-[-1]"></div>
      <Background3D />

      <div className="container mx-auto px-4 h-screen py-6 max-w-7xl flex flex-col">
        
        {/* PROFESSIONAL HEADER */}
        <header className="flex justify-between items-end mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative">
                <ShieldCheck size={40} className="text-cyan-500" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white leading-none flex items-center gap-1">
                FLASH<span className="text-cyan-400">CORE</span> <span className="text-xs bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 ml-2">PRO V2.1</span>
              </h1>
              <p className="text-xs text-cyan-400/60 tracking-[0.3em] font-semibold">INSTITUTIONAL GRADE ARBITRAGE ENGINE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <div className="text-xs text-gray-500 uppercase">System Status</div>
                <div className={`text-sm font-bold flex items-center justify-end gap-2 ${isRunning ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    <Radio size={14} className={isRunning ? "animate-ping" : ""} />
                    {isRunning ? "EXECUTION IN PROGRESS" : "OPERATIONAL / STANDBY"}
                </div>
             </div>
          </div>
        </header>

        {/* MAIN DASHBOARD GRID Layout */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            
            {/* LEFT SIDEBAR - CONTROLS (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                
                {/* Wallet Module */}
                <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-50 transition-opacity"><Wallet size={40} className="text-cyan-500"/></div>
                    <h3 className="text-gray-400 text-[10px] font-bold uppercase mb-3 tracking-wider flex items-center gap-2">
                        <Lock size={12}/> Controller Identity
                    </h3>
                    
                    {account ? (
                        <div>
                            <div className="text-xl font-bold text-white mb-1 font-sans">{account.slice(0,6)}...{account.slice(-4)}</div>
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Authenticated via MetaMask
                            </div>
                        </div>
                    ) : (
                        <button onClick={connectWallet} 
                            className="w-full py-3 bg-gradient-to-r from-cyan-900 to-cyan-700 hover:from-cyan-800 hover:to-cyan-600 border border-cyan-500/30 rounded-xl text-cyan-100 font-bold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] group">
                            CONNECT WALLET <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    )}
                </div>

                {/* EXECUTION MODULE (The Big Button Refined) */}
                <div className="flex-1 bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-xl flex flex-col">
                    <button 
                        onClick={runBot}
                        disabled={isRunning || !account}
                        className={`flex-1 rounded-xl relative overflow-hidden group transition-all
                        ${isRunning 
                            ? 'bg-gray-900/50 cursor-not-allowed' 
                            : 'bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-purple-600/10 hover:bg-cyan-600/30 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]'
                        }`}
                    >
                        {/* Button background effects */}
                        {!isRunning && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>}
                        {isRunning && <div className="absolute inset-0 bg-black/60 z-10"></div>}

                        <div className="h-full flex flex-col items-center justify-center relative z-20 p-6">
                            {isRunning ? (
                                <>
                                    <Cpu size={48} className="text-cyan-500 animate-spin mb-4 duration-[3s]"/>
                                    <span className="text-xl font-black text-cyan-500 tracking-widest mb-2">EXECUTING</span>
                                    <span className="text-xs text-cyan-300/70">Processing Smart Contracts...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={48} className={`mb-4 ${account ? 'text-cyan-400 group-hover:text-white group-hover:scale-110 transition-all' : 'text-gray-600'}`}/>
                                    <span className={`text-2xl font-black tracking-widest mb-2 ${account ? 'text-white' : 'text-gray-500'}`}>INITIATE</span>
                                    <span className={`text-xs uppercase tracking-wider ${account ? 'text-cyan-300/70 group-hover:text-cyan-200' : 'text-gray-600'}`}>
                                        {account ? 'Execute Flash Loan Sequence' : 'Wallet Connection Required'}
                                    </span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* RIGHT CONTENT - DASHBOARD (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0">
                
                {/* TOP: THE SCANNER (Dominant Feature) */}
                <div className="h-[55%] bg-black/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                     {/* Subtle background grid for pro feel */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] z-0 pointer-events-none"></div>
                     <div className="relative z-10 h-full">
                        <MarketScanner />
                     </div>
                </div>

                {/* BOTTOM: TERMINAL LOGS */}
                <div className="h-[45%] bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-xl">
                    <div className="bg-black/60 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal size={14} className="text-gray-400"/>
                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">System Execution Logs /var/log/flashcore</span>
                        </div>
                        <div className="flex gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                             <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                             <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="p-4 overflow-y-auto font-mono text-[11px] space-y-1.5 flex-1 scrollbar-thin scrollbar-thumb-gray-800/50 scrollbar-track-transparent flex flex-col-reverse">
                        {/* Using flex-col-reverse to keep new logs at the bottom naturally */}
                        {logs.map((log, i) => (
                            <div key={i} className={`pl-2 border-l-2 ${log.includes("FAIL") || log.includes("ERROR") || log.includes("REVERT") || log.includes("CANCEL") ? "border-red-500/50 text-red-400 bg-red-900/10" : log.includes("SUCCESS") ? "border-emerald-500/50 text-emerald-400 bg-emerald-900/10" : log.includes("Hash") ? "border-yellow-500/50 text-yellow-300" : "border-cyan-900/50 text-cyan-200/70"}`}>
                                <span className="opacity-30 mr-2">#</span>{log}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </main>
      </div>
    </div>
  );
}

export default App;