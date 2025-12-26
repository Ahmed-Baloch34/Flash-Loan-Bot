import { ethers } from "ethers";

async function main() {
    // Ye sabse reliable public nodes hain
    const rpcUrls = [
        "https://ethereum-sepolia.publicnode.com", // Primary
        "https://1rpc.io/sepolia",                 // Backup 1
        "https://rpc.sepolia.org"                  // Backup 2
    ];

    console.log("🔄 Connecting to Blockchain...");

    for (const url of rpcUrls) {
        try {
            console.log(`Trying URL: ${url}`);
            const provider = new ethers.JsonRpcProvider(url);
            
            // Network check
            const network = await provider.getNetwork();
            const blockNumber = await provider.getBlockNumber();

            console.log(`✅ SUCCESS! Connection jud gaya!`);
            console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
            console.log(`🧱 Current Block Number: ${blockNumber}`);
            
            // Agar connect ho gaya to loop yahin rok do
            return; 
        } catch (error) {
            console.log(`❌ Failed connecting to ${url}, trying next...`);
        }
    }

    console.error("❌ Sabhi URLs fail ho gaye. Internet connection check karein.");
}

main();