import Web3 from 'web3';
import { AbiItem } from 'web3-utils/types';
import { sleep } from '../utils';
import logger from '../../logger';
import { ITokenInfo, NETWORK_TYPE, TOKEN } from '../../services/operations/interfaces';
import { getConfig } from '../../configs';
import { getEvent, getHmyLogs } from './helpers';

const log = logger.module('validator:tokensTracker');

const CHECK_EVENTS_INTERVAL = 30000;

const config = getConfig();

interface IGetEventsParams {
  abi: AbiItem[];
  address: string;
  event: string;
  fromBlock: number;
  toBlock: number;
}

interface IHmyTokensTrackerParams {
  token: TOKEN;
  tokenManagerJsonAbi: AbiItem[];
  tokenManagerAddress: string;
  network: NETWORK_TYPE;
  blockHeight: number;
}

export class HmyTokensTracker {
  token: TOKEN;
  network: NETWORK_TYPE;
  lastBlock = 0;
  options = { gasPrice: Number(process.env.GAS_PRICE), gasLimit: 6721900 };

  tokenManagerJsonAbi: AbiItem[];
  tokenManagerAddress: string;

  web3Hmy: Web3;
  web3: Web3;

  tokens: ITokenInfo[] = [];

  constructor(params: IHmyTokensTrackerParams) {
    this.web3Hmy = new Web3(`${process.env.HMY_NODE_URL}`);
    this.web3 = new Web3(`${process.env.ETH_NODE_URL}/${process.env.INFURA_PROJECT_ID}`);

    this.tokenManagerJsonAbi = params.tokenManagerJsonAbi;
    this.tokenManagerAddress = params.tokenManagerAddress;

    this.token = params.token;
    this.network = params.network;

    if (process.env.HMY_TOKENS_TRACKER_ENABLE === 'true' && !process.env.ASSETS_SUBGRAPH_URL) {
      if (params.token === TOKEN.ERC20 && params.network === NETWORK_TYPE.ETHEREUM) {
        this.tokens = [
          {
            erc20Address: config[NETWORK_TYPE.ETHEREUM].contracts.busd,
            hrc20Address: '0xe176ebe47d621b984a73036b9da5d834411ef734',
            token: this.token,
          },
          {
            erc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            hrc20Address: config[NETWORK_TYPE.ETHEREUM].contracts.nativeTokenHRC20,
            token: this.token,
          },
          {
            erc20Address: config[NETWORK_TYPE.ETHEREUM].contracts.link,
            hrc20Address: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
            token: this.token,
          },
          {
            // MAGGOT
            erc20Address: '0x163c754eF4D9C03Fc7Fa9cf6Dd43bFc760E6Ce89',
            hrc20Address: '0xBfD4F1699b83eDBa1106B6E224b7aC599A40be1F',
            token: this.token,
            network: NETWORK_TYPE.ETHEREUM,
          },
          {
            // USDT
            erc20Address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            hrc20Address: '0x3C2B8Be99c50593081EAA2A724F0B8285F5aba8f',
            token: this.token,
            network: NETWORK_TYPE.ETHEREUM,
          },
        ];
      }

      if (params.token === TOKEN.ERC20 && params.network === NETWORK_TYPE.BINANCE) {
        this.tokens = [
          {
            erc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            hrc20Address: config[NETWORK_TYPE.BINANCE].contracts.nativeTokenHRC20,
            token: this.token,
            network: NETWORK_TYPE.BINANCE,
          },
        ];
      }

      console.log('HMY_TOKENS_TRACKER_ENABLE: true');

      this.init(params.blockHeight);
    }
  }

  getTokens = () => {
    return this.tokens;
  };

  getEvents = async (params: IGetEventsParams) => {
    let res = { result: [] };

    const event = getEvent(this.web3Hmy, params.abi, params.event);
    const topicAddress = event.signature;

    res = await getHmyLogs({
      fromBlock: '0x' + params.fromBlock.toString(16),
      toBlock: '0x' + params.toBlock.toString(16),
      address: params.address,
      topics: [topicAddress],
    });

    let logs: any[] = res.result.map(item => {
      try {
        const decode = this.web3.eth.abi.decodeLog(event.inputs, item.data, item.topics.slice(1));

        return decode;
      } catch (e) {
        log.error('Error decodeLog', { error: e, item });
        return null;
      }
    });

    logs = logs.filter(a => !!a);

    const result = [];

    if (logs.length) {
      const tokenManager = new this.web3Hmy.eth.Contract(
        [
          {
            constant: true,
            inputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            name: 'mappedTokens',
            outputs: [
              {
                internalType: 'address',
                name: '',
                type: 'address',
              },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ],
        params.address
      );

      for (let j = 0; j < logs.length; j++) {
        const token = logs[j];

        const hrc20Address = await tokenManager.methods
          .mappedTokens(token.tokenReq)
          .call(this.options);

        result.push({
          erc20Address: token.tokenReq,
          hrc20Address,
          token: this.token,
          network: this.network,
        });
      }
    }

    return result;
  };

  private init = async (blockHeight: number) => {
    let latest = blockHeight;

    try {
      const res = await this.web3Hmy.eth.getBlockNumber();
      latest = Number(res);

      let i = blockHeight;
      const step = 1024;

      while (i < latest) {
        try {
          const newTokens = await this.getEvents({
            abi: this.tokenManagerJsonAbi,
            address: this.tokenManagerAddress,
            event: 'TokenMapAck',
            fromBlock: i,
            toBlock: Math.min(i + step, latest),
          });

          this.tokens = this.tokens.concat(newTokens);

          i = i + step;
        } catch (e) {
          await sleep(5000);
        }
      }

      // console.log(`Tokens init success ${this.token} ${this.network}`);
    } catch (e) {
      log.error('Error init', { error: e, latest });
    }

    setTimeout(() => this.init(latest), CHECK_EVENTS_INTERVAL);
  };
}
