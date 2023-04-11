import Web3 from 'web3';
import { EthMethods } from './EthMethods';
import { EthManager } from './EthManager';
import { EthEventsTracker } from './EthEventsTracker';
import { EthTokensTracker } from './EthTokensTracker';
import { getConfig, TConfig } from '../../configs';
import { NETWORK_TYPE, TOKEN } from '../../services/operations/interfaces';
import { databaseService } from '../../services/database';
import ethManagerJson = require('../contracts/LINKEthManager.json');
import erc20Json = require('../contracts/MyERC20.json');
import multiSigWalletJson = require('../contracts/MultiSigWallet.json');
import tokenManagerJson = require('../contracts/TokenManager.json');
import busdJson = require('../contracts/IBUSD.json');
import ethManagerERC20Json = require('../contracts/EthManagerERC20.json');
import ethManagerHRC20Json = require('../contracts/EthManagerHRC20.json');

export * from './EthMethods';

/**
 * Refreshes provider instance and attaches even handlers to it
 */

export interface IMethods {
  web3URL: string;
  web3: Web3;
  config: TConfig;
  ethTokensTracker?: EthTokensTracker;
  ethEventsTracker?: EthEventsTracker;
  ethEventsTrackerRes?: EthEventsTracker;
  ethTokensEventsTracker?: EthEventsTracker;
  ethMethods?: EthMethods;
  ethMethodsBUSD?: EthMethods;
  ethMethodsLINK?: EthMethods;
  getValidatorAddress?: () => string;
}

const init = (config: TConfig, network: NETWORK_TYPE, nodeUrl?: string): IMethods => {
  const web3URL = nodeUrl || config.nodeURL;

  console.log('nodeUrl', web3URL);

  const web3 = new Web3(web3URL);

  const methods: IMethods = { web3, web3URL, config };

  const ethMultiSigManager = new EthManager(
    multiSigWalletJson,
    config.contracts.multisigWallet,
    web3
  );

  methods.getValidatorAddress = () => ethMultiSigManager.account?.address;

  const ethTokenManager = new EthManager(tokenManagerJson, config.contracts.tokenManager, web3);

  if (network === NETWORK_TYPE.BINANCE) {
    const ethEventsTrackerRes = new EthEventsTracker({
      ethManager: ethMultiSigManager,
      web3,
      eventName: 'Submission',
      network,
      database: databaseService,
      relativeHeight: 10000,
      maxDelta: 1000,
      interval: 30000,
    });

    methods.ethEventsTrackerRes = ethEventsTrackerRes;
  }

  const ethEventsTracker = new EthEventsTracker({
    ethManager: ethMultiSigManager,
    web3,
    eventName: 'Submission',
    network,
    database: databaseService,
    reserveEventsTracker: methods.ethEventsTrackerRes,
    relativeHeight: 6000,
    maxDelta: network === NETWORK_TYPE.BINANCE ? 400 : 1000,
    interval: network === NETWORK_TYPE.BINANCE ? 4000 : 10000,
  });

  methods.ethEventsTracker = ethEventsTracker;

  const ethTokensEventsTracker = new EthEventsTracker({
    ethManager: ethTokenManager,
    web3,
    eventName: 'TokenMapAck',
    network,
    database: databaseService,
    height: 6909340,
  });

  methods.ethTokensEventsTracker = ethTokensEventsTracker;

  const ethTokenBUSD = new EthManager(busdJson, config.contracts.busd, web3);

  const ethManager = new EthManager(ethManagerJson, config.contracts.busdManager, web3);
  const ethToken = new EthManager(busdJson, config.contracts.busd, web3);

  methods.ethMethods = new EthMethods({
    web3,
    ethManager: ethManager,
    ethMultiSigManager,
    ethToken: ethToken,
    ethEventsTracker,
    network: network,
  });

  if (config.tokens.includes(TOKEN.BUSD)) {
    const ethManagerBUSD = new EthManager(ethManagerJson, config.contracts.busdManager, web3);
    const ethTokenBUSD = new EthManager(busdJson, config.contracts.busd, web3);

    methods.ethMethodsBUSD = new EthMethods({
      web3,
      ethManager: ethManagerBUSD,
      ethMultiSigManager,
      ethToken: ethTokenBUSD,
      ethEventsTracker,
      network: network,
    });
  }

  if (config.tokens.includes(TOKEN.LINK)) {
    const ethManagerLINK = new EthManager(ethManagerJson, config.contracts.linkManager, web3);
    const ethTokenLINK = new EthManager(erc20Json, config.contracts.link, web3);

    methods.ethMethodsLINK = new EthMethods({
      web3,
      ethManager: ethManagerLINK,
      ethMultiSigManager,
      ethToken: ethTokenLINK,
      ethEventsTracker,
      network: network,
    });
  }

  if (config.tokens.includes(TOKEN.ERC20)) {
    const ethManagerERC20 = new EthManager(
      ethManagerERC20Json,
      config.contracts.erc20Manager,
      web3
    );
  }

  if (config.tokens.includes(TOKEN.HRC20) || config.tokens.includes(TOKEN.ONE)) {
    const ethManagerHRC20 = new EthManager(
      ethManagerHRC20Json,
      config.contracts.hrc20Manager,
      web3
    );
  }

  if (config.tokens.includes(TOKEN.ETH)) {
    const ethManagerETH = new EthManager(ethManagerERC20Json, config.contracts.ethManager, web3);
  }

  return methods;
};

const config = getConfig();

export const ethNetwork = init(
  config.ethClient,
  NETWORK_TYPE.ETHEREUM,
  config.ethClient.nodeURL + `/${process.env.INFURA_PROJECT_ID}`
);
export const binanceNetwork = init(
  config.binanceClient,
  NETWORK_TYPE.BINANCE,
  process.env.BSC_RPC_URL
);
