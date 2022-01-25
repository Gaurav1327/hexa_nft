var HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = "vast cool save absorb behave turkey scorpion jealous mango insect cat blade";
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/8f9ca5ce84ab44458983edd3b707c4e2");
      },
      network_id: 3,
    }
  },
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.6.6",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
