import { ethers } from "ethers";

// 1. Connection Setup
const RPC_URL = "https://ethereum-sepolia.publicnode.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 2. Aave V3 Pool Address (Sepolia)
const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

// 3. ABI
const AAVE_ABI = [
    "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)"
];

async function checkUserHealth(targetAddress: string) {
    console.log(`\n🕵️  Scouting User: ${targetAddress}`);
    console.log("Connecting to Aave Protocol...");

    try {
        const poolContract = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_ABI, provider);

        // Fetch Data
        const data = await poolContract.getUserAccountData(targetAddress);

        // Format Data
        const totalCollateral = ethers.formatUnits(data.totalCollateralBase, 8);
        const totalDebt = ethers.formatUnits(data.totalDebtBase, 8);
        const healthFactor = ethers.formatUnits(data.healthFactor, 18);

        console.log("------------------------------------------------");
        console.log(`💰 Total Collateral: $${totalCollateral}`);
        console.log(`💸 Total Debt:       $${totalDebt}`);
        console.log(`❤️  HEALTH FACTOR:   ${healthFactor}`);
        console.log("------------------------------------------------");

        if (parseFloat(healthFactor) < 1.0) {
            console.log("🚨 OPPORTUNITY: Banda doob raha hai! LIQUIDATE KARO!");
        } else {
            console.log("✅ User Safe hai (No Liquidation).");
        }

    } catch (error) {
        console.error("❌ Abhi bhi error hai:", error);
    }
}

// 4. Address ko lowercase mein convert karke bhejna (Ye trick hai!)
// Maine yahan 'toLowerCase()' laga diya hai, ab error nahi aayega.
const rawAddress = "0x464C71f6c2F760DdA6093dCB91C24c11e72D5cf9";
checkUserHealth(rawAddress.toLowerCase());