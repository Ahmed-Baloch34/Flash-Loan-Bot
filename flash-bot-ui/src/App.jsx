import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from "socket.io-client"; // ✅ Socket Import
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Zap, Box, Terminal, Play, Square, Settings } from 'lucide-react';
import './App.css';

// --- CONFIG ---
const SERVER_URL = "http://localhost:3001";
const socket = io(SERVER_URL); // ✅ WebSocket Connection

// --- PARTICLE BACKGROUND (Same as before) ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particlesArray = [];
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() * 1) - 0.5;
        this.speedY = (Math.random() * 1) - 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }
      draw() {
        ctx.fillStyle = 'rgba(0, 242, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (let i = 0; i < 100; i++) particlesArray.push(new Particle());
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
};

// --- MAIN APP COMPONENT ---
function App() {
  const [stats, setStats] = useState({
    status: "OFFLINE",
    lastBlock: 0,
    targetsFound: 0,
    gasLimit: 500000,
    logs: []
  });
  
  const [liquidationData, setLiquidationData] = useState([]); // 📋 Table Data
  const [chartData, setChartData] = useState([]);
  const [inputGas, setInputGas] = useState(500000);
  const logsEndRef = useRef(null);

  // ✅ SOCKET.IO LISTENERS (Real-time Magic)
  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected to Socket Server"));
    
    // Status & Logs Update
    socket.on("status_update", (data) => {
        setStats(prev => ({ ...prev, ...data }));
        // Simulate Chart Data
        setChartData(prev => {
            const newData = [...prev, { val: Math.random() * 100 + 50 }];
            if (newData.length > 20) newData.shift();
            return newData;
        });
    });

    // Logs only update
    socket.on("log_update", (logs) => {
        setStats(prev => ({ ...prev, logs }));
    });

    // Liquidation JSON Data
    socket.on("liquidation_data", (data) => {
        setLiquidationData(data);
    });

    return () => socket.off(); // Cleanup
  }, []);

  // Auto Scroll Logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stats.logs]);

  // Actions
  const startBot = async () => { await axios.post(`${SERVER_URL}/api/start`); };
  const stopBot = async () => { await axios.post(`${SERVER_URL}/api/stop`); };
  
  const updateGas = async () => {
    await axios.post(`${SERVER_URL}/api/settings`, { gasLimit: inputGas });
    alert(`Gas Limit Updated to ${inputGas}`);
  };

  return (
    <>
      <ParticleBackground />
      <div className="dashboard-container">
        
        {/* HEADER */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1>⚡ FlashCore <span style={{fontSize:'1rem', color:'#555'}}>PHASE 4</span></h1>
            <p style={{color: 'rgba(255,255,255,0.6)'}}>Socket.io Connected / Live Monitor</p>
          </div>
          <div className={`glass-card`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stats.status === "SCANNING" ? '#00ff41' : '#ff0000', boxShadow: stats.status === "SCANNING" ? '0 0 10px #00ff41' : 'none' }} />
            <span style={{ fontWeight: 'bold' }}>{stats.status || "OFFLINE"}</span>
          </div>
        </header>

        {/* CONTROL PANEL (Buttons + Gas Input) */}
        <div className="glass-card" style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-start" onClick={startBot}><Play size={20} /> START</button>
          <button className="btn btn-stop" onClick={stopBot}><Square size={20} /> STOP</button>
          
          {/* ⛽ GAS LIMIT SETTING */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', background: 'rgba(0,0,0,0.4)', padding: '5px 15px', borderRadius: '8px' }}>
            <Settings size={18} color="#00f2ff" />
            <span style={{fontSize: '0.9rem', color: '#ccc'}}>GAS LIMIT:</span>
            <input 
                type="number" 
                value={inputGas} 
                onChange={(e) => setInputGas(Number(e.target.value))}
                style={{ background: 'transparent', border: 'none', color: '#fff', width: '80px', fontWeight: 'bold', borderBottom: '1px solid #555' }} 
            />
            <button onClick={updateGas} style={{background: '#00f2ff', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'bold', fontSize:'0.8rem', padding:'2px 8px'}}>SET</button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid-cols-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-card">
                    <Box size={30} color="#00f2ff" />
                    <div style={{marginTop: '10px'}}>
                      <div className="stat-label">Block Height</div>
                      <div className="stat-value">#{stats.lastBlock}</div>
                    </div>
                  </div>
                  <div className="glass-card">
                    <ShieldAlert size={30} color="#ff0055" />
                    <div style={{marginTop: '10px'}}>
                      <div className="stat-label">Opp. Found</div>
                      <div className="stat-value">{stats.targetsFound}</div>
                    </div>
                  </div>
                </div>

                {/* 📋 LIVE MONITOR (TABLE) */}
                <div className="glass-card" style={{ flex: 1 }}>
                    <h3><Activity size={16} style={{display:'inline'}} /> Priority Liquidations</h3>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#ddd' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', color: '#00f2ff' }}>
                                <th style={{padding: '8px'}}>Token</th>
                                <th>User</th>
                                <th>Health</th>
                                <th>Est. Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liquidationData.length === 0 ? (
                                <tr><td colSpan="4" style={{textAlign:'center', padding:'20px'}}>No Targets Yet...</td></tr>
                            ) : (
                                liquidationData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{padding: '8px', color: '#fff', fontWeight:'bold'}}>{row.token}</td>
                                        <td style={{fontFamily: 'monospace', color: '#888'}}>{row.user}</td>
                                        <td style={{color: row.health < 1 ? '#ff0055' : '#00ff41'}}>{row.health}</td>
                                        <td style={{color: '#00ff41'}}>{row.profit}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* RIGHT: LOGS & CHART */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3><Zap size={16} style={{display:'inline'}} /> Profit Analytics</h3>
                <div style={{ width: '100%', height: '150px', marginBottom: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                        <Line type="monotone" dataKey="val" stroke="#00f2ff" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                </div>

                <h3 style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                  <Terminal size={16} style={{display:'inline'}} /> Terminal
                </h3>
                <div className="terminal-window" style={{height: '200px'}}>
                  {stats.logs.map((log, index) => (
                    <div key={index} className="log-entry">
                      <span className="log-msg">{'>'} {log}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
            </div>
        </div>
      </div>
    </>
  );
}

export default App;