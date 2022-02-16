require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-etherscan");

const {
  PRIVATE_KEY,
  PRIVATE_KEY_MUMBAI,
  PRIVATE_KEY_MUMBAI1,
  ALCHEMY_API_KEY_POLYGON,
  ALCHEMY_API_KEY_MUMBAI,
  POLYGON_SCAN,
} = process.env;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_POLYGON}`,
      accounts: [`${PRIVATE_KEY}`],
    },
    polygon2: {
      url: `https://polygon-rpc.com/`,
      accounts: [`${PRIVATE_KEY}`],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY_MUMBAI}`,
      accounts: [`${PRIVATE_KEY_MUMBAI}`, `${PRIVATE_KEY_MUMBAI1}`],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: "YOUR_ETHERSCAN_API_KEY",
      polygon: `${POLYGON_SCAN}`,
      polygonMumbai: `${POLYGON_SCAN}`,
    },
  },
};
