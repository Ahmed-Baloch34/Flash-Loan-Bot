import hre from "hardhat"; 

async function main() {
  console.log("🚀 Deploying FlashLoan Contract...");

  // Aave V3 PoolAddressesProvider (Sepolia)
  const providerAddress = "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A";

  // Note: Hum ab 'hre.ethers' use kar rahe hain
  const FlashLoan = await hre.ethers.getContractFactory("FlashLoan");
  const flashLoan = await FlashLoan.deploy(providerAddress);

  await flashLoan.waitForDeployment();

  console.log("✅ Contract Deployed Successfully!");
  console.log("📜 Contract Address:", await flashLoan.getAddress());
  console.log("👉 Is Address ko copy karke sambhal lein!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});