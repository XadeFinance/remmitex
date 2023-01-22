import BN from "bn.js";
import { artifacts, ethers } from "hardhat";
import { ERC20FakeContract, ERC20FakeInstance } from "../../types/truffle-contracts/ERC20Fake";
import { PendingPoolContract, PendingPoolInstance } from "../../types/truffle-contracts/PendingPool";

const ERC20Fake = artifacts.require("ERC20Fake") as ERC20FakeContract;
const PendingPool = artifacts.require("PendingPool") as PendingPoolContract;

export async function deployErc20Fake(
    initSupply: BN = new BN(0),
    name = "name",
    symbol = "symbol",
    decimal: BN = new BN(18),
): Promise<ERC20FakeInstance> {
    const instance = await ERC20Fake.new();
    await instance.initializeERC20Fake(initSupply, name, symbol, decimal);
    return instance
}

export async function deployPendingPool(): Promise<PendingPoolInstance> {
    const instance = await PendingPool.new();
    await instance.initialize();
    return instance
}
