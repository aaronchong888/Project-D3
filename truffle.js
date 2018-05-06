var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "--YOUR ETH WALLET SEED--"; 	////// replace this with your own wallet seed

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    infura: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/--YOUR INFURA KEY--");	////// replace this with your own key
      },
      network_id: 4
    }
  }
};

