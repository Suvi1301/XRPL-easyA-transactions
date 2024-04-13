import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { XRPay } from "../typechain-types";
import { XRPayToken } from "../typechain-types";
import { Wallet } from "ethers";

describe("XRPay", () => {
  let accounts: SignerWithAddress[];
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let contract: XRPay;
  let ERC20Token;
  let token: XRPayToken;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  const generateKeysFromString = (s: string) => {
    const privateKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(s));
    const wallet = new ethers.Wallet(privateKey);

    return {
      wallet: wallet,
      privateKey: privateKey,
    };
  };

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    alice = accounts[1];
    bob = accounts[2];

    const XRPay = await ethers.getContractFactory("XRPay");
    const xrpay = await XRPay.deploy();
    await xrpay.deployed();
    contract = xrpay;

    ERC20Token = await ethers.getContractFactory("XRPayToken");

    token = await ERC20Token.deploy();
    token.connect(bob).mint("10000000");
  });

  describe("Deposit", () => {
    it("should store the correct deposit details and emits DepositEvent for native deposits", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("1");

      const depositTx = await contract
        .connect(alice)
        .deposit(keys.wallet.address, amount, ZERO_ADDRESS, 0, { value: amount });
      const receipt = await depositTx.wait();

      const depositIndex = receipt.events?.find(c => c.event === "DepositEvent")?.args?.[0] as number;
      const deposit = await contract.deposits(depositIndex);

      expect(deposit.publicKey).to.equal(keys.wallet.address);
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
        .deposit(keys.wallet.address, amount, ZERO_ADDRESS, 0);
      expect(depositTx).to.be.revertedWith("Invalid Amount");
    });

    it("should reject deposits with wrong token type", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("0");

      const depositTx = contract
        .connect(alice)
        .deposit(keys.wallet.address, amount, ZERO_ADDRESS, 3);
      expect(depositTx).to.be.revertedWith("Invalid Amount");
    });

    it("should have the correct balance for native token", async () => {
      const initialBalance = await ethers.provider.getBalance(contract.address);

      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("1");

      const depositTx = await contract
        .connect(alice)
        .deposit(keys.wallet.address, amount, ZERO_ADDRESS, 0, { value: amount });
      await depositTx.wait();

      expect(await ethers.provider.getBalance(contract.address)).to.equal(
        initialBalance.add(amount)
      );
    });

    it("should have the correct balance for ERC20 token", async () => {
      const initialBalance = await token.balanceOf(contract.address);
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseUnits("1", 6);

      await token.connect(bob).increaseAllowance(contract.address, amount);
      const depositTx = await contract
        .connect(bob)
        .deposit(keys.wallet.address, amount, token.address, 1);
      await depositTx.wait();

      expect(await token.balanceOf(contract.address)).to.equal(
        initialBalance.add(amount)
      );
    });
  });


  describe("Claim", () => {
    function toEthSignedMessageHash(messageHash: string) {
      // Convert message hash to eth signed message hash
      const message = ethers.utils.arrayify(
        ethers.utils.solidityKeccak256(
          ["string", "bytes32"],
          ["\x19Ethereum Signed Message:\n32", messageHash]
        )
      );

      return message;
    }

    it("should claim correct native amount", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseEther("1");

      const depositTx = await contract
        .connect(alice)
        .deposit(keys.wallet.address, amount, ZERO_ADDRESS, 0, { value: amount });
      const receipt = await depositTx.wait();

      const depositIndex = receipt.events?.find(c => c.event === "DepositEvent")?.args?.[0] as number;

      const messageHash = ethers.utils.solidityKeccak256(["address"], [bob.address]);
      const signedMessageHash = toEthSignedMessageHash(messageHash)

      const previousBalance = await ethers.provider.getBalance(bob.address)

      const claimTx = await contract
        .claim(
          depositIndex,
          bob.address,
          signedMessageHash,
          keys.wallet.signMessage(ethers.utils.arrayify(messageHash)),
        )

      await claimTx.wait();
      expect(await ethers.provider.getBalance(bob.address)).to.eq(previousBalance.add(amount))

    })

    it("should claim correct amount with ERC20 Token", async () => {
      const secret = "SECRET";
      const keys = generateKeysFromString(secret);

      const amount = ethers.utils.parseUnits("1", 6);

      await token.connect(bob).increaseAllowance(contract.address, amount);
      const depositTx = await contract
        .connect(bob)
        .deposit(keys.wallet.address, amount, token.address, 1);
      const receipt = await depositTx.wait();
      const depositIndex = receipt.events?.find(c => c.event === "DepositEvent")?.args?.[0] as number;

      const messageHash = ethers.utils.solidityKeccak256(["address"], [alice.address]);
      const signedMessageHash = toEthSignedMessageHash(messageHash);

      const previousBalance = await token.balanceOf(alice.address);

      const claimTx = await contract
        .claim(
          depositIndex,
          alice.address,
          signedMessageHash,
          keys.wallet.signMessage(ethers.utils.arrayify(messageHash)),
        )

      // await claimTx.wait();
      expect(await token.balanceOf(alice.address)).to.eq(previousBalance.add(amount));

    })
  });
});
