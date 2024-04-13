import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { XRPay } from "../typechain-types";

describe("XRPay", () => {
  let accounts: SignerWithAddress[];
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let contract: XRPay;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const generateKeysFromString = (s: string) => {
    const privateKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(s));
    const wallet = new ethers.Wallet(privateKey);

    return {
      address: wallet.address,
      privateKey: privateKey,
    };
  };

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    alice = accounts[0];
    bob = accounts[1];

    const XRPay = await ethers.getContractFactory("XRPay");
    const xrpay = await XRPay.deploy();
    await xrpay.deployed();
    contract = xrpay;
  });

  describe("Deposit", () => {
    it("should store the correct deposit details and emits DepositEvent for native deposits", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("1");

      const depositTx = await contract
        .connect(alice)
        .deposit(keys.address, amount, ZERO_ADDRESS, 0, { value: amount });
      const receipt = await depositTx.wait();

      const depositIndex = receipt.events?.[0].args?.[0] as number;
      const deposit = await contract.deposits(depositIndex);

      expect(deposit.publicKey).to.equal(keys.address);
      expect(deposit.amount).to.equal(amount);
      expect(deposit.tokenAddress).to.equal(ZERO_ADDRESS);
      expect(deposit.tokenType).to.equal(0);
      expect(deposit.senderAddress).to.equal(alice.address);
    });

    it("should reject deposits with zero value for native deposits", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("0");

      const depositTx = contract
        .connect(alice)
        .deposit(keys.address, amount, ZERO_ADDRESS, 0);
      expect(depositTx).to.be.revertedWith("Invalid Amount");
    });

    it("should reject deposits with wrong token type", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("0");

      const depositTx = contract
        .connect(alice)
        .deposit(keys.address, amount, ZERO_ADDRESS, 3);
      expect(depositTx).to.be.revertedWith("Invalid Amount");
    });

    it("should have the correct balance for native token", async () => {
      const initialBalance = await ethers.provider.getBalance(contract.address);

      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("1");

      const depositTx = await contract
        .connect(alice)
        .deposit(keys.address, amount, ZERO_ADDRESS, 0, { value: amount });
      await depositTx.wait();

      expect(await ethers.provider.getBalance(contract.address)).to.equal(
        initialBalance.add(amount)
      );
    });
  });

  describe("Claim", () => {});
});
