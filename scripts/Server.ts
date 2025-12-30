// scripts/Server.ts
import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

// --- BOT SETUP ---
const app = express();
app.use(cors()); // UI ko connect karne ki permission
app.use(express.json());

const PORT = 3001; // Backend Port

// Global Data (Jo UI par dikhega)
let botStats = {
    status: "IDLE", // IDLE, SCANNING, ATTACKING
    lastBlock: 0,
    targetsFound: 0,
    activeTargets: [] as string[],
    logs: [] as string[]
};

// Log Helper
function logToUI(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${message}`;
    console.log(logMsg);
    
    // UI ke liye last 20 logs save rakho
    botStats.logs.unshift(logMsg);
    if (botStats.logs.length > 50) botStats.logs.pop();
}

// --- BOT ENGINE LOGIC (Simplified for Server) ---
const RPC_URL = "https://mainnet.base.org";
const provider = new ethers.JsonRpcProvider(RPC_URL);

let isRunning = false;

async function startBotProcess() {
    if (isRunning) return;
    isRunning = true;
    botStats.status = "SCANNING";
    logToUI("🚀 Bot Engine Started via UI...");

    provider.on("block", async (blockNumber) => {
        if (!isRunning) return;
        
        botStats.lastBlock = blockNumber;
        
        // Mocking Logic (Yahan aapka asli BotEngine logic aayega)
        // Main logic short mein likh raha hu example ke liye
        if (blockNumber % 5 === 0) {
           // logToUI(`Scanning Block #${blockNumber}...`);
        }
    });
}

function stopBotProcess() {
    isRunning = false;
    botStats.status = "STOPPED";
    provider.removeAllListeners("block"); // Stop listening
    logToUI("🛑 Bot Stopped by User.");
}

// --- API ENDPOINTS (UI YAHAN SE DATA LEGA) ---

// 1. Status Check
app.get("/api/status", (req, res) => {
    res.json(botStats);
});

// 2. Start Command
app.post("/api/start", (req, res) => {
    startBotProcess();
    res.json({ message: "Bot command received: START" });
});

// 3. Stop Command
app.post("/api/stop", (req, res) => {
    stopBotProcess();
    res.json({ message: "Bot command received: STOP" });
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`📡 SERVER READY! UI API running on: http://localhost:${PORT}`);
    console.log(`=============================================`);
});