import Web3 from 'web3';
import { EthEventsTracker } from './EthEventsTracker';
import logger from '../../logger';
import { ITokenDetails, NETWORK_TYPE, TOKEN } from '../../services/operations/interfaces';

const log = logger.module('validator:EthTokensTracker');

const CHECK_INTERVAL = Number(process.env.ETH_CHECK_EVENTS_INTERVAL);

export interface IEthTokensTrackerMethod {
  getMappingFor(tokenAddr: string): Promise<string>;

  tokenDetails(tokenAddr: string): Promise<Array<any>>;
}

interface IEthEventTrackerParams {
  ethEventsTracker: EthEventsTracker;
  ethMethods: IEthTokensTrackerMethod;
  web3: Web3;
  network: NETWORK_TYPE;
  token: TOKEN;
}

export class EthTokensTracker {
  ethEventsTracker: EthEventsTracker;
  ethMethods: IEthTokensTrackerMethod;
  tokens: ITokenDetails[] = [];
  token: TOKEN;
  network: NETWORK_TYPE;

  constructor(params: IEthEventTrackerParams) {
    this.ethEventsTracker = params.ethEventsTracker;
    this.ethMethods = params.ethMethods;
    this.network = params.network;
    this.token = params.token;

    if (process.env.HMY_TOKENS_TRACKER_ENABLE === 'true') {
      this.init();
    }
  }

  init = async () => {
    const erc20Address = await this.ethMethods.getMappingFor(
      '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    );

    if (this.token == TOKEN.HRC20) {
      this.tokens = [
        {
          hrc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          erc20Address,
          name: 'Harmony ONE',
          symbol: 'ONE',
          decimals: 18,
          network: this.network,
          token: TOKEN.HRC20,
        },
      ];
    }

    setInterval(() => {
      const events = this.ethEventsTracker.getEventsHistory();

      events.forEach(async event => {
        const token = event.returnValues;

        if (this.tokens.find(t => t.erc20Address === token.tokenAck)) {
          return;
        }

        try {
          const [name, symbol, decimals] = await this.ethMethods.tokenDetails(token.tokenAck);

          this.tokens.push({
            hrc20Address: token.tokenReq,
            erc20Address: token.tokenAck,
            name,
            symbol,
            decimals,
            network: this.network,
            token: this.token,
          });
        } catch (e) {
          log.error('Error get token details', { error: e && e.message, network: this.network });
        }
      });
    }, CHECK_INTERVAL);
  };

  getTokens = () => {
    return this.tokens;
  };
}
