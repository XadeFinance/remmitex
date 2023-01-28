import BN from "bn.js";
import "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { deployErc20Fake, deployPendingPool } from "./test_helpers/contracts";
import { PendingPoolInstance } from "../types/truffle-contracts/PendingPool";
import { ERC20FakeInstance } from "../types/truffle-contracts/ERC20Fake";

describe("PendingPool", function () {

  let PendingPool: PendingPoolInstance;
  let owner: SignerWithAddress;
  let Alice: SignerWithAddress;
  let Bob: SignerWithAddress;
  let usdc: ERC20FakeInstance;

  this.beforeEach(async () => {
    PendingPool = await deployPendingPool();
    usdc = await deployErc20Fake(new BN(2_000_000));

    const accounts = await ethers.getSigners();
    owner = accounts[0];
    Alice = accounts[1];
    Bob = accounts[2];

    await usdc.approve(PendingPool.address, 1_000_000)
  })

  describe("Deployment", function () {
    it("Should deploy and upgrade correctly", async () => {
      const pendingPoolV1 = await ethers.getContractFactory("PendingPool");
      const PendingPoolV1 = await upgrades.deployProxy(pendingPoolV1, {initializer : "initialize" });
      await PendingPoolV1.deployed();
      await PendingPoolV1.setRedeemer(Alice.address);

      const PendingPoolV2 = await ethers.getContractFactory("PendingPool");
      const upgraded = await upgrades.upgradeProxy(PendingPoolV1.address, PendingPoolV2);
  
      const redeemer = await upgraded.redeemer();
      expect(redeemer).to.equal(Alice.address);
    });

    it("Should set the right owner", async () => {
      expect(await PendingPool.owner()).to.equal(owner.address);
    });
  });

  describe("SetRedeemer", function () {
    it("Should set redeemer correctly", async () => {
      await PendingPool.setRedeemer(Alice.address);
      expect(await PendingPool.redeemer()).to.equal(Alice.address);
    });

    it("force error: onlyOwner", async () => {
      expect(await PendingPool.setRedeemer(Alice.address, {from: Alice.address})).to.be.revertedWith("XadeOwnableUpgrade: caller is not the owner");
    });
  })

  describe("Deposits", function () {
    it("Should deposit correct amount", async () => {
      await PendingPool.deposit(usdc.address, 500);
      expect(await usdc.balanceOf(PendingPool.address)).to.eq(500);
    });

    it("force error, 'PendingPool: Invalid amount'", async () => {
      expect(await PendingPool.deposit(usdc.address, 0)).to.be.revertedWith("PendingPool: Invalid amount");
    });

    it("force error, insufficient funds", async () => {
      await usdc.transfer(Alice.address, 200);
      await usdc.approve(PendingPool.address, 500, {from: Alice.address});
      expect(await PendingPool.deposit(usdc.address, 500, {from: Alice.address})).to.be.revertedWith('ERC20: transfer amount exceeds balance');
    });
  })

  describe("Redeem", function () {
    this.beforeEach(async function () {
      await PendingPool.setRedeemer(Bob.address);
      await usdc.transfer(PendingPool.address, 1000);
    })

    it("Should successfully redeem token", async () => {
      await PendingPool.redeem(usdc.address, Alice.address, 500, {from: Bob.address});
      expect(await usdc.balanceOf(Alice.address)).to.eq(500);
      expect(await usdc.balanceOf(PendingPool.address)).to.eq(500);
    });

    it("Force error: 'Recipient cannot be zero address'", async () => {
      const zeroAddr = "0x0000000000000000000000000000000000000000";
      expect(await PendingPool.redeem(usdc.address, zeroAddr, 200, {from: Bob.address})).to.be.revertedWith("Recipient cannot be zero address");
    });

    it("Should emit event on redeem", async () => {
      expect(await PendingPool.redeem(usdc.address, Alice.address, 500, {from: Bob.address})).to.emit(PendingPool, "PaymentRedeemed").withArgs(Alice.address, 500, usdc.address);
    });

    it("Force error: 'PendingPool: caller not redeemer'", async () => {
      expect(await PendingPool.redeem(usdc.address, Alice.address, 500, {from: Alice.address})).to.be.revertedWith("PendingPool: caller not redeemer");
    });
  })

  describe("balanceOf", function () {
    it("Should return the right balance", async () => {
      await usdc.transfer(PendingPool.address, 300);
      expect(await PendingPool.balanceOf(usdc.address)).to.eq(300);
    });
  })
});
