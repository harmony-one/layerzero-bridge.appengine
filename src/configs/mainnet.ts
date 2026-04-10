import { TConfig } from './index';
import { TOKEN, NETWORK_TYPE } from '../services/operations/interfaces';
import { legacyContracts } from './legacy';
import { getAlchemyRpcUrl } from './rpc';

const binanceClient: TConfig = {
  nodeURL: getAlchemyRpcUrl('bnb-mainnet'),
  privateNodeUrl: getAlchemyRpcUrl('bnb-mainnet'),
  explorerURL: 'https://bscscan.com/',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
  gasPrice: 6000000000,
  gasLimit: 1000000,
};

const arbitrumClient: TConfig = {
  nodeURL: getAlchemyRpcUrl('arb-mainnet'),
  explorerURL: 'https://arbiscan.io/',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
  gasPrice: 200000000,
  gasLimit: 2000000,
};

const ethClient: TConfig = {
  nodeURL: getAlchemyRpcUrl('eth-mainnet'),
  privateNodeUrl: getAlchemyRpcUrl('eth-mainnet'),
  explorerURL: 'https://etherscan.io',
  tokens: [TOKEN.ERC721, TOKEN.ERC1155, TOKEN.HRC721, TOKEN.HRC1155, TOKEN.HRC20, TOKEN.BUSD, TOKEN.LINK, TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH],
  contracts: legacyContracts,
};

const lineaClient: TConfig = {
  nodeURL: getAlchemyRpcUrl('linea-mainnet'),
  explorerURL: 'https://lineascan.build',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
};

const baseClient: TConfig = {
  nodeURL: getAlchemyRpcUrl('base-mainnet'),
  explorerURL: 'https://basescan.org',
  tokens: [TOKEN.ERC20, TOKEN.ONE, TOKEN.ETH, TOKEN.HRC20],
  contracts: legacyContracts,
};

export const mainnet: Record<NETWORK_TYPE, TConfig> = {
  [NETWORK_TYPE.BINANCE]: binanceClient,
  [NETWORK_TYPE.ARBITRUM]: arbitrumClient,
  [NETWORK_TYPE.ETHEREUM]: ethClient,
  [NETWORK_TYPE.LINEA]: lineaClient,
  [NETWORK_TYPE.BASE]: baseClient,
};
