import { mainnet } from './mainnet';
import { testnet } from './testnet';
import { TOKEN } from '../services/operations/interfaces';

export const getConfig = () => {
  switch (process.env.NETWORK) {
    case 'mainnet':
      return mainnet;
    case 'testnet':
      return testnet;
    default:
      return mainnet;
  }
};

export type TConfig = {
  nodeURL: string;
  explorerURL: string;
  tokens: TOKEN[];
  contracts: {
    busd: string;
    link: string;
    busdManager: string;
    linkManager: string;
    erc20Manager: string;
    erc721Manager: string;
    multisigWallet: string;
    tokenManager: string;
    hrc20Manager: string;
    hrc721Manager: string;
    hrc721TokenManager: string;
    hrc1155Manager: string;
    hrc1155TokenManager: string;
    erc1155Manager: string;
    // todo need delete?
    erc1155TokenManager: string;
    ethManager: string;
    nativeTokenHRC20: string;
  };
  gasPrice?: number;
  gasLimit?: number;
};
