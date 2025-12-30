// scripts/EnhancedPositionMonitor.ts
import { ethers } from 'ethers';
import { PriorityQueue, UserPosition } from './PriorityQueue';

// ✅ REAL BASE CHAIN CONFIGURATION
const RPC_URL = "https://mainnet.base.org"; 
const AAVE_POOL_ADDRESS = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"; 

const POOL_ABI = [
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
  "event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint256 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)",
  "event Supply(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)"
];

// Helper to prevent RPC Bans
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchRiskyPositions() {
  console.log("------------------------------------------------");
  console.log("📡 THE SCOUT: Omni-Scanning Base Chain (Supply + Borrow)...");
  console.log("------------------------------------------------");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, provider);

  try {
    const currentBlock = await provider.getBlockNumber();
    console.log(`✅ Connection Stable. Head: ${currentBlock}`);

    // Strategy: Scan last 5000 blocks (approx 2.5 hours)
    const TOTAL_BLOCKS = 5000; 
    const BATCH_SIZE = 1000; // Smaller batch to prevent Timeout
    
    const activeUsers = new Set<string>();
    
    console.log(`🔍 Scanning for ANY Activity (Deposits or Loans)...`);

    for (let i = 0; i < TOTAL_BLOCKS; i += BATCH_SIZE) {
        const fromBlock = currentBlock - TOTAL_BLOCKS + i;
        const toBlock = fromBlock + BATCH_SIZE;
        
        process.stdout.write(`   > Scanning blocks ${fromBlock} -> ${toBlock}... `); // Inline print
        
        try {
            // 1. Scan for Borrowers
            const borrowEvents = await poolContract.queryFilter(poolContract.filters.Borrow(), fromBlock, toBlock);
            borrowEvents.forEach((ev: any) => { if(ev.args?.[1]) activeUsers.add(ev.args[1]); });

            // 2. Scan for Suppliers (Depositors) - Inme se bhi kafi log Borrower hote hain
            const supplyEvents = await poolContract.queryFilter(poolContract.filters.Supply(), fromBlock, toBlock);
            supplyEvents.forEach((ev: any) => { if(ev.args?.[1]) activeUsers.add(ev.args[1]); });

            console.log(`[Hits: ${borrowEvents.length + supplyEvents.length}]`);
            
            // 3. Polite Delay (RPC ko saans lene do)
            await delay(200); 

        } catch (err) {
            console.log(`❌ Timeout (Skipping Chunk)`);
        }
    }

    // FALLBACK: known heavy users on Base if scan fails
    if (activeUsers.size === 0) {
        console.log("\n⚠️ Network Congestion. Loading fallback active node list...");
        activeUsers.add("0x0c0d117297298687f8582998344682029107067d");
        activeUsers.add("0x2c9C858977F47e62a370e1b9E4A96C4126D77133");
        activeUsers.add("0x4a3A6Dd60A34bb2Aba60D73B4C88315E9CeB6A3D");
        activeUsers.add("0xe27BFf95221d609206D44089C3517A762951C818");
    }

    console.log(`\n👥 ANALYZING ${activeUsers.size} UNIQUE WALLETS FOR DEBT RISK...`);
    
    const queue = new PriorityQueue();
    let foundWithDebt = 0;

    for (const userAddress of activeUsers) {
        try {
            const data = await poolContract.getUserAccountData(userAddress);
            
            const totalCollateralUSD = Number(ethers.formatUnits(data.totalCollateralBase, 8));
            const totalDebtUSD = Number(ethers.formatUnits(data.totalDebtBase, 8)); // 8 decimals on Base
            
            // Sirf wahi dikhayenge jinke paas ACTUAL DEBT hai
            if (totalDebtUSD > 10) { // Min $10 debt to show
                let healthFactor = parseFloat(ethers.formatUnits(data.healthFactor, 18));
                if (healthFactor > 100) healthFactor = 100;

                queue.enqueue({
                    id: userAddress,
                    healthFactor: healthFactor,
                    totalCollateralUSD: totalCollateralUSD,
                    totalDebtUSD: totalDebtUSD
                });
                foundWithDebt++;
            }
        } catch (err) { }
    }

    displayTargets(queue, foundWithDebt);

  } catch (error: any) {
    console.error("❌ Critical Error:", error.message);
  }
}

function displayTargets(queue: PriorityQueue, count: number) {
    const targets = queue.getAll();
    
    if (targets.length > 0) {
      console.log(`\n📊 REAL-TIME AAVE MARKET DATA (BASE CHAIN):`);
      console.log(`----------------------------------------------------------------`);
      console.log(`TYPE       | USER (Last 4) | HEALTH F. | DEBT ($)     | STATUS`);
      console.log(`----------------------------------------------------------------`);
      
      targets.forEach(t => {
        const isRisky = t.healthFactor < 1.05;
        const status = isRisky ? "LIQUIDATE" : "HEALTHY";
        const color = isRisky ? "\x1b[31m" : "\x1b[32m"; // Red vs Green
        const reset = "\x1b[0m";
        const userShort = "..." + t.id.slice(-4);
        
        console.log(`${color}${status.padEnd(10)} | ${userShort.padEnd(13)} | ${t.healthFactor.toFixed(4).padEnd(9)} | $${t.totalDebtUSD.toFixed(2).padEnd(11)} | ${status}${reset}`);
      });
      
      console.log(`----------------------------------------------------------------`);
      console.log(`✅ Processed ${count} active positions.`);
      
    } else {
      console.log("✅ Scanned users have deposits but NO DEBT currently.");
    }
}

fetchRiskyPositions();