import Web3 from 'web3';
import { Harmony } from '@harmony-js/core';
import { ChainType } from '@harmony-js/utils';
import { HmyMethodsBase } from './HmyMethodsBase';

import { HmyEventsTracker } from './HmyEventsTracker';
import { databaseService } from '../../services/database';

export * from './HmyMethodsBase';

const createHmySdk = () => {
  return new Harmony(
    // let's assume we deploy smart contract to this end-point URL
    process.env.HMY_NODE_URL,
    {
      chainType: ChainType.Harmony,
      chainId: Number(process.env.HMY_CHAIN_ID),
    }
  );
};

export const hmy = createHmySdk();

export const web3Hmy = new Web3(process.env.HMY_NODE_URL);

export const hmyEventsTracker = new HmyEventsTracker({
  hmyManagerMultiSigAddress: process.env.HMY_MULTISIG_WALLET,
  database: databaseService,
});

export const hmyMethods = new HmyMethodsBase({
  hmyTokenContractAddress: process.env.HMY_BUSD_CONTRACT,
  hmyManagerAddress: process.env.HMY_BUSD_MANAGER_CONTRACT,
  hmyManagerMultiSigAddress: process.env.HMY_MULTISIG_WALLET,
  hmyTokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT,
  hmyEventsTracker,
});

// export const hmyTokensTrackerERC20 = new HmyTokensTracker({
//   token: TOKEN.ERC20,
//   tokenManagerJsonAbi: tokenManagerJsonERC20.abi as AbiItem[],
//   tokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT,
//   network: NETWORK_TYPE.ETHEREUM,
//   blockHeight: process.env.NETWORK === 'mainnet' ? 5384930 : 1894340,
// });

// export const hmyTokensTrackerBEP20 = new HmyTokensTracker({
//   token: TOKEN.ERC20,
//   tokenManagerJsonAbi: tokenManagerJsonERC20.abi as AbiItem[],
//   tokenManagerAddress: process.env.TOKEN_MANAGER_CONTRACT_FOR_BSC,
//   network: NETWORK_TYPE.BINANCE,
//   blockHeight: process.env.NETWORK === 'mainnet' ? 10784982 : 6941273,
// });