// scripts/Server.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite Frontend URL (Check agar 3000 hai toh badal dena)
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;
const JSON_FILE_PATH = path.join(__dirname, "priority_liquidations.json");

// --- GLOBAL BOT DATA ---
let botState = {
    status: "IDLE", // IDLE, SCANNING, ATTACKING
    gasLimit: 500000, // Default Gas
    lastBlock: 129384,
    targetsFound: 0,
    logs: [] as string[]
};

// --- HELPER: DUMMY DATA GENERATOR (Agar file nahi hai) ---
if (!fs.existsSync(JSON_FILE_PATH)) {
    const dummyData = [
        { token: "WETH", user: "0x123...abc", health: 0.98, profit: "0.5 ETH" },
        { token: "USDC", user: "0x789...xyz", health: 0.95, profit: "1200 USDC" }
    ];
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(dummyData, null, 2));
}

// --- HELPER: LOGGING ---
function logToUI(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${message}`;
    console.log(logMsg);
    botState.logs.unshift(logMsg);
    if (botState.logs.length > 50) botState.logs.pop();
    
    // Sabhi connected clients ko update bhejo
    io.emit("log_update", botState.logs);
}

// --- SOCKET.IO CONNECTION ---
io.on("connection", (socket) => {
    console.log("⚡ UI Connected:", socket.id);

    // Connection judte hi current data bhejo
    socket.emit("status_update", botState);
    
    // Send JSON Data
    const rawData = fs.readFileSync(JSON_FILE_PATH, "utf-8");
    socket.emit("liquidation_data", JSON.parse(rawData));

    socket.on("disconnect", () => {
        console.log("❌ UI Disconnected");
    });
});

// --- API ENDPOINTS ---
app.post("/api/start", (req, res) => {
    if (botState.status !== "SCANNING") {
        botState.status = "SCANNING";
        logToUI("🚀 Bot Engine Started via UI...");
        io.emit("status_update", botState); // Broadcast change
    }
    res.json({ message: "Started" });
});

app.post("/api/stop", (req, res) => {
    botState.status = "STOPPED";
    logToUI("🛑 Bot Stopped by User.");
    io.emit("status_update", botState);
    res.json({ message: "Stopped" });
});

// Update Gas Limit
app.post("/api/settings", (req, res) => {
    const { gasLimit } = req.body;
    if (gasLimit) {
        botState.gasLimit = gasLimit;
        logToUI(`⛽ Gas Limit Updated to: ${gasLimit}`);
        io.emit("status_update", botState);
    }
    res.json({ success: true });
});

// --- MOCK ENGINE LOOP (Real-time Updates Dikhane ke liye) ---
setInterval(() => {
    if (botState.status === "SCANNING") {
        botState.lastBlock++;
        
        // Kabhi kabhi random log bhejo
        if (Math.random() > 0.7) {
            logToUI(`Scanning Block #${botState.lastBlock} - No Opportunities.`);
        }
        
        // UI ko batao block change hua
        io.emit("status_update", botState);
    }
}, 3000); // Har 3 second mein block update

server.listen(PORT, () => {
    console.log(`\n📡 SOCKET SERVER RUNNING ON: http://localhost:${PORT}`);
});