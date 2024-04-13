import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = [process.env.PRIVATE_KEY || ""];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sidechain: {
      url: "https://rpc-evm-sidechain.xrpl.org",
      accounts,
    },
  },
};

export default config;
