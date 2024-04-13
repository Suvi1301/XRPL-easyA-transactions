import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("XRPayToken");
  const contract = await Contract.deploy();
  console.log("Contract deployed to address:", contract.address);
}

main();
