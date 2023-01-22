import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-truffle5";

import dotenv  from "dotenv";
dotenv.config()

const ALFAJORES_URL = process.env.ALFAJORES_URL || "";
const POLYGON_URL = process.env.POLYGON_URL || "";
const SHARDEUM_URL = process.env.SHARDEUM_URL || "";
const ALFAJORES_MNEMONIC = process.env.ALFAJORES_MNEMONIC || "";
const POLYGON_MNEMONIC = process.env.POLYGON_MNEMONIC || "";
const SHARDEUM_MNEMONIC = process.env.SHARDEUM_MNEMONIC || "";
const GAS_PRICE = 2_000_000_000;


const config: HardhatUserConfig = {
  networks : {
    Alfajores : {
      url: ALFAJORES_URL,
      gasPrice : GAS_PRICE,
      accounts : [ALFAJORES_MNEMONIC]
    },

    PolygonPoS : {
      url: POLYGON_URL,
      gasPrice : GAS_PRICE,
      accounts : [POLYGON_MNEMONIC]
    },

    Shardeum : {
      url: SHARDEUM_URL,
      gasPrice : GAS_PRICE,
      accounts : [SHARDEUM_MNEMONIC]
    },
  },

  solidity: {
    compilers : [
      {version : "0.8.1"},
      {version : "0.8.6"},
      {version: "0.6.9"},
    ],

    settings : {
      optimizer : {
        enabled : true,
        runs : 200
      }
    }

  }
};

export default config;
