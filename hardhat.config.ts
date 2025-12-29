import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Yahan apni Alchemy URL Dalein (Agar hai). 
// Agar nahi hai toh maine ek Public URL daal diya hai (ye slow ho sakta hai)
const MAINNET_RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/Q4xnbs2OwbWpZAkgWfdBY"; 

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/...", // Purana wala rehne dein
      accounts: [] // Apna private key yahan rakh sakte hain
    }
  },
};

export default config;