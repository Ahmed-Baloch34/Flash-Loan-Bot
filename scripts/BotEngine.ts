import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// =============================================================
// ⚙️ CONFIGURATION & CONSTANTS (BASE MAINNET)
// =============================================================
const RPC_URL = "https://mainnet.base.org";
const AAVE_POOL_ADDRESS = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

// 👇 Aapka Smart Contract Address (.env se aayega)
const LIQUIDATOR_CONTRACT_ADDRESS = process.env.LIQUIDATOR_CONTRACT_ADDRESS!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// Tokens on Base (Filhal hum Maan ke chal rahe hain: Debt=USDC, Collateral=WETH)
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

const HISTORY_BLOCKS_TO_SCAN = 2000; // Thoda kam kiya taaki jaldi start ho
const BATCH_SIZE = 2000; 

// ABIs
const POOL_ABI = [
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
  "event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint256 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)",
  "event Supply(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)"
];

// Humare Contract ka ABI (Sirf Attack function)
const LIQUIDATOR_ABI = [
    "function executeLiquidation(address _assetToBorrow, uint256 _amountToBorrow, address _targetUser, address _collateralAsset) external"
];

// Global Memory
let trackedUsers = new Set<string>();
let isScanning = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function startBot() {
    console.clear();
    console.log("=================================================");
    console.log("🚀 FLASHCORE BOT ENGINE v3.0 (REAL MODE 💸)");
    console.log("=================================================");
    console.log("🔗 Connecting to Base Mainnet...");

    // Setup Provider & Wallet (Is baar Wallet zaroori hai sign karne ke liye)
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, provider);
    const liquidatorContract = new ethers.Contract(LIQUIDATOR_CONTRACT_ADDRESS, LIQUIDATOR_ABI, wallet);

    const currentBlock = await provider.getBlockNumber();
    console.log(`✅ Connected via Wallet: ${wallet.address}`);
    console.log(`📡 Head Block: ${currentBlock}`);

    // -------------------------------------------------------------
    // 1️⃣ PHASE 1: DEEP HISTORY SCAN
    // -------------------------------------------------------------
    console.log(`\n🕵️ [PHASE 1] Scanning last ${HISTORY_BLOCKS_TO_SCAN} blocks for active users...`);
    
    for (let i = 0; i < HISTORY_BLOCKS_TO_SCAN; i += BATCH_SIZE) {
        const fromBlock = currentBlock - HISTORY_BLOCKS_TO_SCAN + i;
        const toBlock = fromBlock + BATCH_SIZE;
        try {
            const borrowEvents = await poolContract.queryFilter(poolContract.filters.Borrow(), fromBlock, toBlock);
            borrowEvents.forEach((ev: any) => { if(ev.args?.[1]) trackedUsers.add(ev.args[1]); });
            process.stdout.write(`.`);
        } catch (err) { console.log("x"); }
    }
    console.log(`\n✅ Found ${trackedUsers.size} potential candidates.`);

    // -------------------------------------------------------------
    // 2️⃣ PHASE 2: LIVE SURVEILLANCE
    // -------------------------------------------------------------
    console.log("\n👀 [PHASE 2] LIVE SNIPER MODE ACTIVATED...");
    console.log("-------------------------------------------------");

    provider.on("block", async (blockNumber) => {
        if (isScanning) return; 
        isScanning = true;

        try {
            // New Users check
            const events = await poolContract.queryFilter(poolContract.filters.Borrow(), blockNumber, blockNumber);
            events.forEach((ev: any) => { if (ev.args?.[1]) trackedUsers.add(ev.args[1]); });

            // WAR ROOM LOGIC
            if (trackedUsers.size > 0) {
                const allTargets = Array.from(trackedUsers);
                // Har block pe random 5 users check karo (Rate limit bachane ke liye)
                const batch = allTargets.sort(() => 0.5 - Math.random()).slice(0, 5);
                
                // Pass Contract reference too
                await analyzeAndAttackBatch(poolContract, liquidatorContract, batch);
            }
            
            process.stdout.write(`\r⏳ Block #${blockNumber} | Monitoring: ${trackedUsers.size} Users `);

        } catch (error) {
            console.log("\n⚠️ Network glitch, retrying...");
        }
        isScanning = false;
    });
}

// ---------------------------------------------------------
// 🧠 LOGIC HANDLERS
// ---------------------------------------------------------

async function analyzeAndAttackBatch(poolContract: ethers.Contract, liquidatorContract: ethers.Contract, users: string[]) {
    let potentialVictims: any[] = [];

    // 1. DATA COLLECTION
    for (const user of users) {
        try {
            const data = await poolContract.getUserAccountData(user);
            
            // Debt is in Base Currency (USD 8 decimals)
            const debtUSD = Number(ethers.formatUnits(data.totalDebtBase, 8));
            
            // Filter: Sirf wo log jinka Debt > $10 hai (Gas fees cover karne ke liye)
            if (debtUSD > 10) { 
                let hf = parseFloat(ethers.formatUnits(data.healthFactor, 18));
                if (hf > 100) hf = 100;

                // 🚨 ATTACK CONDITION: HF < 1.0
                if (hf < 1.0) {
                    potentialVictims.push({
                        user: user,
                        hf: hf,
                        debtUSD: debtUSD,
                        estimatedProfit: debtUSD * 0.05 
                    });
                } 
                else if (hf < 1.05) {
                    // Sirf Alert dikhao agar banda khatre mein hai
                   // console.log(`\n⚠️ WATCH: ${user.slice(0,4)}.. HF:${hf.toFixed(3)}`);
                }
            }
        } catch (e) {}
    }

    // 2. EXECUTION (Agar shikaar mila)
    if (potentialVictims.length > 0) {
        console.log(`\n🔥 FOUND ${potentialVictims.length} VULNERABLE TARGETS!`);
        
        // Sort by highest profit
        potentialVictims.sort((a, b) => b.estimatedProfit - a.estimatedProfit);

        for (const victim of potentialVictims) {
            await executeRealAttack(liquidatorContract, victim);
            break; // Ek block mein ek hi attack karo (Nonce issue se bachne ke liye)
        }
    }
}

// ⚔️ REAL TRANSACTION EXECUTION 🔫
async function executeRealAttack(liquidatorContract: ethers.Contract, victim: any) {
    console.log(`\n⚔️ [ATTACK LAUNCHED] Target: ${victim.user} | HF: ${victim.hf}`);
    
    try {
        // STEP 1: Amount Calculate Karein
        // Note: Hum assume kar rahe hain Debt USDC mein hai.
        // Hum total debt ka 50% liquidate kar sakte hain maximum.
        const amountToLiquidateUSD = victim.debtUSD * 0.5; 
        
        // USDC ke 6 decimals hote hain. (Example: $100 = 100000000)
        const amountInWei = ethers.parseUnits(amountToLiquidateUSD.toFixed(6), 6);

        console.log(`💰 Asking Flash Loan for: $${amountToLiquidateUSD.toFixed(2)} USDC`);

        // STEP 2: Send Transaction
        // Function: executeLiquidation(assetToBorrow, amount, target, collateral)
        const tx = await liquidatorContract.executeLiquidation(
            USDC_ADDRESS,     // Asset (USDC)
            amountInWei,      // Amount
            victim.user,      // Target
            WETH_ADDRESS,     // Collateral (WETH)
            {
                gasLimit: 600000 // Thoda extra gas safety ke liye
            }
        );

        console.log(`🚀 Tx Sent! Hash: ${tx.hash}`);
        console.log(`⏳ Waiting for confirmation...`);

        const receipt = await tx.wait();
        console.log(`✅ LIQUIDATION SUCCESSFUL! Block: ${receipt.blockNumber}`);
        console.log(`💵 Check your wallet for Profit!`);

    } catch (error: any) {
        console.log(`❌ ATTACK REVERTED (Common in Flash Loans)`);
        if (error.reason) console.log(`Reason: ${error.reason}`);
        // console.error(error); // Uncomment for full error
    }
}

startBot();