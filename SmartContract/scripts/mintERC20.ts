import { ethers } from "hardhat";

async function main() {
  const erc20Address = "0xaEF0B30Ac473035F20F82C23f5Fe5a939b950B43";
  const contract = await ethers.getContractAt("XRPayToken", erc20Address);
  await contract.mint(ethers.utils.parseUnits("1000", 6));
}

main();
