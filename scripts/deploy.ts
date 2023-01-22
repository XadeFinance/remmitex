import { ethers, upgrades } from "hardhat";

async function getImplementation(proxyAddr: string) {
  const proxyAdmin = await upgrades.admin.getInstance();

  return proxyAdmin.getProxyImplementation(proxyAddr)
}

async function main() {

  const pendingPool = await ethers.getContractFactory("PendingPool");
  console.log("Deploying PendingPool...");
  const PendingPool = await upgrades.deployProxy(pendingPool, {initializer : "initialize" });
  await PendingPool.deployed();

  const impAddr = await getImplementation(PendingPool.address);

  console.log(`PendingPool deployed to", =>, Proxy: ${PendingPool.address}, implementation: ${impAddr}`);

  return PendingPool.address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
