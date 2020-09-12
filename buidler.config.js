require('@babel/register')
require('./buidler/tasks')

// Process Env Variables
require("dotenv").config()
const INFURA_ID = process.env.INFURA_ID
const PRIV_KEY = process.env.PRIV_KEY
const EXEC_PRIV_KEY = process.env.EXEC_PRIV_KEY

usePlugin("@nomiclabs/buidler-waffle")
usePlugin("@nomiclabs/buidler-ethers")

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      // Standard
      accounts: [PRIV_KEY, EXEC_PRIV_KEY],
      chainId: 4,
      // gas: 4000000,  // 4 million
      // gasPrice: "auto",
      url: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
      // Custom
      // Rinkeby: addressBook
      addressBook: {
        // Rinkeby: erc20s
        erc20: {
          DAI: "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
          "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa": "DAI",
          KNC: "0x6FA355a7b6bD2D6bD8b927C489221BFBb6f1D7B2",
          "0x6FA355a7b6bD2D6bD8b927C489221BFBb6f1D7B2": "KNC",
        },

        // Rinkeby: Gelato
        gelatoExecutor: {
          default: "0xa5A98a6AD379C7B578bD85E35A3eC28AD72A336b", // PermissionedExecutors
        },

        // Rinkeby: Kyber
        kyber: {
          ETH: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          networkProxy: "0xF77eC7Ed5f5B9a5aee4cfa6FFCaC6A4C315BaC76",
        }
      }
    }
  },
  // This is a sample solc configuration that specifies which version of solc to use
  solc: {
    version: "0.6.10",
  },
}
