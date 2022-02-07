require("dotenv").config({ path: ".env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonicPhrase = 'myth like bonus scare over problem client lizard pioneer submit female collect';  // fake eth mandala

module.exports = {
  networks: {
    development: {
      provider: () =>
        new HDWalletProvider(mnemonicPhrase, 'http://localhost:8545'),
      host: "127.0.0.1",
      port: 8545,
      network_id: 595,
      gasPrice: 200786445289, // storage_limit = 64001, validUntil = 360001, gasLimit = 10000000
      gas: 42032000,
    },
    development2: {
      host: "127.0.0.1",
      port: 8546,
      network_id: "*",
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://mainnet.infura.io/v3/` + process.env.INFURA_KEY
        ),
      network_id: 1,
      gas: 10000000,
      gasPrice: 101000000000,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: false,
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          `https://rinkeby.infura.io/v3/` + process.env.INFURA_KEY
        ),
      network_id: 4,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    goerli: {
      provider: () => {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://goerli.infura.io/v3/" + process.env.INFURA_KEY
        );
      },
      network_id: "5",
      gas: 4465030,
      gasPrice: 10000000000,
    },
    binance: {
      provider: () => {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://bsc-dataseed.binance.org/"
        );
      },
      network_id: "56",
      gas: 70000000,
      gasPrice: 8000000000,
    },
    oasis: {
      provider: () => {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://emerald.oasis.dev/"
        );
      },
      network_id: 42262,
      gas: 4465030,
      gasPrice: 30000000000,
    },
    karura: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          ""
        ),
      network_id: '686',
      gas: 42032000,
      gasPrice: 200786445289, // storage_limit = 64001, validUntil = 360001, gasLimit = 10000000
      timeoutBlocks: 25,
      confirmations: 0,
    },
    acala: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          ""
        ),
      network_id: '787',
      gas: 42032000,
      gasPrice: 200786445289, // storage_limit = 64001, validUntil = 360001, gasLimit = 10000000
      timeoutBlocks: 25,
      confirmations: 0,
    },
  },

  compilers: {
    solc: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  plugins: ["@chainsafe/truffle-plugin-abigen", "truffle-plugin-verify"],

  api_keys: {
    etherscan: process.env.ETHERSCAN_KEY,
  },
};
