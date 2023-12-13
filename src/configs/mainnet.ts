import { TConfig } from './index';
import { TOKEN, NETWORK_TYPE } from '../services/operations/interfaces';
import { legacyContracts } from './legacy';

const binanceClient: TConfig = {
  nodeURL: 'https://bsc-dataseed.binance.org/',
  privateNodeUrl: process.env.BSC_RPC_URL,
  explorerURL: 'https://bscscan.com/',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
  gasPrice: 6000000000,
  gasLimit: 1000000,
};

const arbitrumClient: TConfig = {
  nodeURL: 'https://rpc.ankr.com/arbitrum',
  explorerURL: 'https://arbiscan.io/',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
  gasPrice: 200000000,
  gasLimit: 2000000,
};

const ethClient: TConfig = {
  nodeURL: 'https://mainnet.infura.io/v3',
  privateNodeUrl: 'https://mainnet.infura.io/v3' + `/${process.env.INFURA_PROJECT_ID}`,
  explorerURL: 'https://etherscan.io',
  tokens: [TOKEN.ERC721, TOKEN.ERC1155, TOKEN.HRC721, TOKEN.HRC1155, TOKEN.HRC20, TOKEN.BUSD, TOKEN.LINK, TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH],
  contracts: legacyContracts,
};

const lineaClient: TConfig = {
  nodeURL: 'https://rpc.linea.build',
  explorerURL: 'https://lineascan.build',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
};

export const mainnet: Record<NETWORK_TYPE, TConfig> = {
  [NETWORK_TYPE.BINANCE]: binanceClient,
  [NETWORK_TYPE.ARBITRUM]: arbitrumClient,
  [NETWORK_TYPE.ETHEREUM]: ethClient,
  [NETWORK_TYPE.LINEA]: lineaClient,
};
