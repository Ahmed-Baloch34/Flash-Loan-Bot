import { ethers } from "hardhat";

async function main() {
  // Aapka Deployed Contract Address
  const contractAddress = "0xF3aA927D8CAf450632F74Cc9e6121e1346E698AC"; 

  console.log("🚀 Requesting Flash Loan...");

  // Contract se connect karte hain
  const flashLoan = await ethers.getContractAt("FlashLoan", contractAddress);

  // Hum USDC (Testnet Version) borrow karenge
  // Sepolia USDC Address
  const tokenAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"; 
  const amount = ethers.parseUnits("10", 6); // 10 USDC borrow karenge (6 decimals)

  try {
    const tx = await flashLoan.fn_RequestFlashLoan(tokenAddress, amount);
    console.log("⏳ Transaction bhej di hai, wait kar rahe hain...");
    
    await tx.wait();

    console.log("✅ Flash Loan Successful! (Transaction Complete)");
    console.log(`🔗 Transaction Hash: https://sepolia.etherscan.io/tx/${tx.hash}`);
  } catch (error) {
    console.error("❌ Transaction Fail ho gayi (Expected tha, neeche padhein kyun):");
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});