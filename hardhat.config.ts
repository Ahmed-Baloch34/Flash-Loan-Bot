import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Ye check karega ki key hai ya nahi, taaki error na aaye
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

const config: HardhatUserConfig = {
  solidity: "0.8.10", // Aave ke liye ye version best hai
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: RPC_URL || "", // Agar URL nahi mila to empty string
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], // Agar Key nahi mili to empty array
      chainId: 11155111,
    },
  },
};

export default config;