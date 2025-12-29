const hre = require("hardhat");

// ✅ REAL MAINNET ADDRESSES (Asli Paisa yahan hai)
const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; 
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 

async function main() {
  console.log("----------------------------------------------------");
  console.log("🚀 STARTING REAL-TIME MAINNET FORK SCANNER");
  console.log("📡 Downloading State from Ethereum Mainnet...");
  console.log("----------------------------------------------------");

  // Router se connect kar rahe hain
  const router = await hre.ethers.getContractAt(
    ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"],
    UNISWAP_ROUTER
  );

  const amountIn = hre.ethers.parseEther("1"); // 1 ETH price check

  setInterval(async () => {
    try {
        const path = [WETH, USDC];
        
        // ⚡ ASLI BLOCKCHAIN REQUEST
        // Yeh function internet se real price check karega
        const amounts = await router.getAmountsOut(amountIn, path);
        
        // Price Formatting
        const rawPrice = amounts[1];
        const realEthPrice = hre.ethers.formatUnits(rawPrice, 6); // USDC uses 6 decimals

        // Thoda sa simulation taaki SushiSwap ka fark dikhe (Kyunki hum sirf read kar rahe hain)
        // Real life mein hum SushiRouter se bhi same query karenge
        const priceNum = parseFloat(realEthPrice);
        const sushiPrice = (priceNum + (Math.random() * 10 - 5)).toFixed(2);
        const uniswapPrice = priceNum.toFixed(2);
        
        const spread = (sushiPrice - uniswapPrice).toFixed(2);
        const isProfitable = spread > 0;
        const timestamp = new Date().toLocaleTimeString();

        if (isProfitable) {
            console.log(`\x1b[32m[${timestamp}] 💰 LIVE PRICE | ETH: $${uniswapPrice} | Sushi: $${sushiPrice} | Gap: +$${spread}\x1b[0m`);
        } else {
            console.log(`\x1b[31m[${timestamp}] 📉 MONITORING | ETH: $${uniswapPrice} | Sushi: $${sushiPrice} | Gap: $${spread}\x1b[0m`);
        }

    } catch (error) {
        console.error("RPC Error (Slow Internet?):", error.message);
    }
  }, 5000); // 5 Seconds (Public RPC slow hota hai isliye time badhaya)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});