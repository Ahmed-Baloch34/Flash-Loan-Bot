import { ethers } from "hardhat";

async function main() {
  console.log("=================================================");
  console.log("🚀 DEPLOYING FLASH LIQUIDATION CONTRACT");
  console.log("=================================================");
  console.log("network: Base Mainnet");

  // ✅ ADDRESS (Lowercase to avoid checksum error)
  const providerAddress = "0xe20fcbdb66b08818db290d8f9edb576931a69637";

  const FlashLiquidation = await ethers.getContractFactory("FlashLiquidation");
  
  console.log("⏳ Deploying... (Please wait)");
  
  // 👇 FIX: Humne yahan 'gasLimit' manual set kiya hai
  const flashLiquidator = await FlashLiquidation.deploy(providerAddress, {
    gasLimit: 5000000, 
  });

  await flashLiquidator.waitForDeployment();

  const address = await flashLiquidator.getAddress();
  
  console.log("\n✅ SUCCESS! Contract Deployed.");
  console.log("-------------------------------------------------");
  console.log("📜 CONTRACT ADDRESS:", address);
  console.log("-------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});