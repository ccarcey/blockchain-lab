require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      allowUnlimitedContractSize: true
    },
  },
};

module.exports = config;
