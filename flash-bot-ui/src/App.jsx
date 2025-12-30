import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Zap, Box, Terminal, Play, Square } from 'lucide-react';
import './App.css';

// --- CONFIG ---
const API_URL = "http://localhost:3001/api";

// --- PARTICLE BACKGROUND COMPONENT ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    const numberOfParticles = 100;

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

    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        // Draw connections
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 242, 255, ${0.1 - distance/1000})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
};

// --- MAIN APP COMPONENT ---
function App() {
  const [stats, setStats] = useState({
    status: "OFFLINE",
    lastBlock: 0,
    targetsFound: 0,
    logs: []
  });

  // Mock data for chart (Graph ko zinda dikhane ke liye)
  const [chartData, setChartData] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`);
        if (res.data) {
          setStats(res.data);
          
          // Update Chart Data (Simulated Gas/Activity)
          setChartData(prev => {
            const newData = [...prev, { time: '', val: Math.random() * 100 + 50 }];
            if (newData.length > 20) newData.shift();
            return newData;
          });
        }
      } catch (error) { /* Silent */ }
    };

    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stats.logs]);

  const startBot = async () => {
    try { await axios.post(`${API_URL}/start`); } catch (e) { alert("Backend Offline"); }
  };
  const stopBot = async () => {
    try { await axios.post(`${API_URL}/stop`); } catch (e) { alert("Backend Offline"); }
  };

  return (
    <>
      <ParticleBackground />
      
      <div className="dashboard-container">
        
        {/* HEADER SECTION */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1>⚡ FlashCore <span style={{fontSize:'1rem', color:'#555'}}>PRO</span></h1>
            <p style={{color: 'rgba(255,255,255,0.6)', marginTop: '5px'}}>Autonomous Liquidation Engine / Base Mainnet</p>
          </div>
          <div className={`glass-card`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px' }}>
            <div style={{ 
              width: '10px', height: '10px', borderRadius: '50%', 
              background: stats.status === "SCANNING" ? '#00ff41' : '#ff0000',
              boxShadow: stats.status === "SCANNING" ? '0 0 10px #00ff41' : '0 0 10px #ff0000'
            }} />
            <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>
              {stats.status || "SYSTEM OFFLINE"}
            </span>
          </div>
        </header>

        {/* CONTROL DECK */}
        <div className="glass-card" style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button className="btn btn-start" onClick={startBot}>
            <Play size={20} /> ACTIVATE PROTOCOL
          </button>
          <button className="btn btn-stop" onClick={stopBot}>
            <Square size={20} /> KILL SWITCH
          </button>
          <div style={{ marginLeft: 'auto', color: '#888', fontSize: '0.9rem' }}>
            <Zap size={16} style={{display:'inline', marginBottom:'-3px'}} /> Latency: 42ms
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid-cols-2">
          
          {/* LEFT COLUMN: METRICS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stat Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="glass-card">
                <Box size={30} color="#00f2ff" />
                <div style={{marginTop: '15px'}}>
                  <div className="stat-label">Current Block</div>
                  <div className="stat-value">#{stats.lastBlock || "0000"}</div>
                </div>
              </div>
              <div className="glass-card">
                <ShieldAlert size={30} color="#ff0055" />
                <div style={{marginTop: '15px'}}>
                  <div className="stat-label">Targets Locked</div>
                  <div className="stat-value">{stats.targetsFound || 0}</div>
                </div>
              </div>
            </div>

            {/* CHART AREA */}
            <div className="glass-card" style={{ flex: 1, minHeight: '250px' }}>
              <h3><Activity size={16} style={{display:'inline'}} /> Network Activity (Gas/Volume)</h3>
              <div style={{ width: '100%', height: '200px', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Tooltip 
                      contentStyle={{backgroundColor: '#000', border: '1px solid #333', color: '#fff'}} 
                      itemStyle={{color: '#00f2ff'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke="#00f2ff" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{ r: 8, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LOGS */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <Terminal size={16} style={{display:'inline'}} /> Live Execution Log
            </h3>
            <div className="terminal-window">
              {(!stats.logs || stats.logs.length === 0) ? (
                <div style={{ color: '#444', textAlign: 'center', marginTop: '100px' }}>
                  // SYSTEM IDLE<br/>// WAITING FOR COMMAND...
                </div>
              ) : (
                stats.logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    <span className="log-time">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                    <span className="log-msg">{'>'} {log}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default App;