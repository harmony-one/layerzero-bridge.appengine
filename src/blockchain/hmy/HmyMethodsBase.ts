import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils/types';
import { HmyManager } from './HmyManager';
import { EventsConstructor } from '../helpers/EventsConstructor';
import { HmyEventsTracker } from './HmyEventsTracker';
import logger from '../../logger';
import { AVG_BLOCK_TIME, BLOCK_TO_FINALITY, sleep } from '../utils';
import { ActionsQueue } from '../helpers/ActionsQueue';
const log = logger.module('validator:hmyMethodsBase');

import erc20Json = require('../contracts/MyERC20.json');
import hmyManagerJsonLINK = require('../contracts/LINKHmyManager.json');
import hmyMultiSigWalletJson = require('../contracts/MultiSigWallet.json');
import { hmy, web3Hmy } from './index';
import { rpcErrorMessage } from '../eth/helpers';
import { getHmyTransactionByHash, getHmyTransactionReceipt } from './helpers';

const queue = new ActionsQueue();

export interface IHmyMethodsInitParams {
  hmyManagerAddress: string;
  hmyTokenManagerAddress: string;
  hmyManagerMultiSigAddress: string;
  options?: { gasPrice: number; gasLimit: number };
  hmyEventsTracker: HmyEventsTracker;
  hmyTokenContractAddress: string;
  hmyManagerJson?: any;
  disableDefaultEvents?: boolean;
}

export class HmyMethodsBase extends EventsConstructor {
  web3Hmy: Web3;
  hmyTokenContract: Contract;
  hmyTokenContractAbi: AbiItem[];
  hmyTokenContractAddress: string;
  hmyManagerAddress: string;
  hmyTokenManagerAddress: string;
  hmyManagerMultiSigAddress: string;
  hmyManagerJson: { abi: AbiItem[] };
  hmyManager: HmyManager;
  hmyManagerMultiSig: HmyManager;
  hmyEventsTracker: HmyEventsTracker;
  options = { gasPrice: Number(process.env.GAS_PRICE), gasLimit: 6721900 };

  tokenContractsCache: Record<string, Contract> = {};

  constructor({
    hmyTokenContractAddress,
    hmyManagerAddress,
    options,
    hmyManagerMultiSigAddress,
    hmyEventsTracker,
    hmyManagerJson,
    disableDefaultEvents,
    hmyTokenManagerAddress,
  }: IHmyMethodsInitParams) {
    super({
      eventsTracker: hmyEventsTracker,
      managerAddress: hmyManagerAddress,
      managerMultiSigAddress: hmyManagerMultiSigAddress,
    });

    this.hmyTokenContractAddress = hmyTokenContractAddress;
    this.hmyManagerAddress = hmyManagerAddress;
    this.hmyTokenManagerAddress = hmyTokenManagerAddress;
    this.hmyManagerMultiSigAddress = hmyManagerMultiSigAddress;
    this.hmyManagerJson = hmyManagerJson || hmyManagerJsonLINK;

    this.initHmySdk();
    this.initHmyManager();
    this.initHmyManagerMultiSig();
    this.initHmyTokenContract();

    if (options) {
      this.options = options;
    }

    this.hmyEventsTracker = hmyEventsTracker;

    if (!disableDefaultEvents) {
      // subscribe current manager to Submission events
      this.hmyEventsTracker.addTrack('Minted', this.hmyManager, this.eventHandler);
      this.hmyEventsTracker.onEventHandler(this.eventHandler);
    }
  }

  initHmySdk = () => {
    this.web3Hmy = web3Hmy;
  };

  initHmyManager = () => {
    this.hmyManager = new HmyManager(this.hmyManagerJson, this.hmyManagerAddress);
  };

  initHmyManagerMultiSig = () => {
    this.hmyManagerMultiSig = new HmyManager(hmyMultiSigWalletJson, this.hmyManagerMultiSigAddress);
  };

  initHmyTokenContract = () => {
    this.hmyTokenContractAbi = erc20Json.abi as AbiItem[];

    this.hmyTokenContract = new this.web3Hmy.eth.Contract(
      erc20Json.abi as AbiItem[],
      this.hmyTokenContractAddress
    );
  };

  isWSConnected = () => {
    return true;
  };

  waitingBlockNumber = async (blockNumber, txnHash, callbackMessage) => {
    {
      const res = await getHmyTransactionByHash(txnHash);

      if (!res.blockNumber) {
        return {
          status: false,
          error: 'txHash no longer exists in the longest chain, possibly forked',
        };
      }

      const expectedBlockNumber = blockNumber + BLOCK_TO_FINALITY;

      while (true) {
        const res = await this.web3Hmy.eth.getBlockNumber();
        const blockNumber = Number(res);

        if (blockNumber <= expectedBlockNumber) {
          callbackMessage(
            `Currently at block ${blockNumber}, waiting for block ${expectedBlockNumber} to be confirmed`
          );

          await sleep(AVG_BLOCK_TIME);
        } else {
          break;
        }
      }
      return { status: true };
    }
  };

  getTransactionReceipt = async txnHash => {
    try {
      const res: any = await getHmyTransactionReceipt(txnHash);

      if (!res) {
        return res;
      }

      const txInfoRes = await getHmyTransactionByHash(txnHash);

      return {
        ...res,
        ...txInfoRes,
        status: res.status === 1,
        hash: txInfoRes?.hash || res.transactionHash,
      };
    } catch (e) {
      if (rpcErrorMessage(e)) {
        log.error('getTransactionReceipt exception rpcErrorMessage', { txnHash, error: e });

        await sleep(10000);

        return await this.getTransactionReceipt(txnHash);
      } else {
        throw e;
      }
    }
  };

  getBalance = async (addr: string) => {
    const addrHex = hmy.crypto.getAddress(addr).checksum;

    let balance = 0;

    try {
      balance = await this.hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
    } catch (e) {
      log.error('hmyTokenContract.methods.balanceOf', { error: e });

      this.hmyTokenContract = new this.web3Hmy.eth.Contract(
        erc20Json.abi as AbiItem[],
        this.hmyTokenContractAddress
      );

      try {
        balance = await this.hmyTokenContract.methods.balanceOf(addrHex).call(this.options);
      } catch (e) {
        log.error('hmyTokenContract.methods.balanceOf 2', { error: e });
      }
    }

    return balance;
  };
}
