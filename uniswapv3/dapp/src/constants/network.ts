
export const NetworkContextName = 'NETWORK'

export const ensUri = 'ens/v2.uniswap.web3api.eth'

export const networks: any = {
  '1': {
    chainId: 1,
    name: 'mainnet',
    node: 'https://mainnet.infura.io/v3/b76cba91dc954ceebff27244923224b1',
    explorer: 'https://etherscan.io'
  },
  '3': {
    chainId: 3,
    name: 'ropsten',
    node: 'https://ropsten.infura.io/v3/b76cba91dc954ceebff27244923224b1',
    explorer: 'https://ropsten.etherscan.io'
  },
  '4': {
    chainId: 4,
    name: 'rinkeby',
    node: 'https://rinkeby.infura.io/v3/b76cba91dc954ceebff27244923224b1',
    explorer: 'https://rinkeby.etherscan.io'
  }
}
