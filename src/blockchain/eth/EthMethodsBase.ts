import BN from 'bn.js';
import { TransactionReceipt } from 'web3-core';
import Web3 from 'web3';
import axios from 'axios';
import { Contract } from 'web3-eth-contract';

import { AVG_BLOCK_TIME, BLOCK_TO_FINALITY, sleep, withDecimals } from '../utils';
import { EthManager } from './EthManager';
import { EventsConstructor } from '../helpers/EventsConstructor';
import { EthEventsTracker } from './EthEventsTracker';
import logger from '../../logger';
import { ActionsQueue } from '../helpers/ActionsQueue';
import { NETWORK_TYPE } from '../../services/operations/interfaces';
import { errorResponse, rpcErrorMessage } from './helpers';

import erc20Json = require('../contracts/MyERC20.json');

const log = logger.module('validator:ethMethodsBase');

const queue = new ActionsQueue();

const WAIT_TIMEOUT = 30 * 60 * 1000;
const AWAIT_STEP = 60 * 1000;

export interface IEthMethodsInitParams {
  web3: Web3;
  ethManager: EthManager;
  ethToken: EthManager;
  ethMultiSigManager: EthManager;
  ethEventsTracker: EthEventsTracker;
  disableDefaultEvents?: boolean;
  gasPrice?: number;
  gasLimit?: number;
  network: NETWORK_TYPE;
}

export class EthMethodsBase extends EventsConstructor {
  web3: Web3;
  ethManager: EthManager;
  ethMultiSigManager: EthManager;
  ethToken: EthManager;
  ethEventsTracker: EthEventsTracker;
  gasPrice?: number;
  gasLimit?: number;
  network?: NETWORK_TYPE;

  tokenContractsCache: Record<string, Contract> = {};

  constructor(params: IEthMethodsInitParams) {
    super({
      eventsTracker: params.ethEventsTracker,
      managerAddress: params.ethManager.address,
      managerMultiSigAddress: params.ethMultiSigManager.address,
    });

    this.web3 = params.web3;
    this.ethManager = params.ethManager;
    this.ethMultiSigManager = params.ethMultiSigManager;
    this.ethToken = params.ethToken;
    this.ethEventsTracker = params.ethEventsTracker;

    this.gasPrice = params.gasPrice;
    this.gasLimit = params.gasLimit;
    this.network = params.network;

    // this.ethEventsTracker.addTrack(
    //   'Execution',
    //   this.ethMultiSigManager.contract,
    //   this.ethMultiSigManager.address,
    //   this.eventHandler,
    //   () => !!Object.keys(this.subscribers).length
    // );

    if (!params.disableDefaultEvents) {
      // subscribe current manager to Submission events
      this.ethEventsTracker.addTrack(
        'Unlocked',
        this.ethManager.contract,
        this.ethManager.address,
        this.eventHandler,
        () => !!Object.keys(this.subscribers).length
      );
      this.ethEventsTracker.onEventHandler(this.eventHandler);
    }

    // setInterval(async () => console.log(this.network, Number(await this.getGasPrice())), 5000);
  }

  isWSConnected = () => {
    return true;
  };

  // getTransactionByHash = async (transactionHash: string) => {
  //   return await web3.eth.getTransaction(transactionHash);
  // };

  getTransactionReceipt = async (transactionHash: string) => {
    const res = await this.web3.eth.getTransactionReceipt(transactionHash);

    if (!res) {
      return res;
    }

    const txInfo = await this.web3.eth.getTransaction(transactionHash);

    return { ...txInfo, ...res };
  };

  getManagerBalance = async () => {
    return await this.ethToken.contract.methods.balanceOf(this.ethManager.address).call();
  };

  waitTransaction = async (transactionHash: string, callback?) => {
    try {
      let txInfo = await this.web3.eth.getTransaction(transactionHash);

      let maxAwaitTimeoutSmall = 19 * 60 * 1000;

      while (!txInfo && maxAwaitTimeoutSmall >= 0) {
        await sleep(30000);

        txInfo = await this.web3.eth.getTransaction(transactionHash);

        maxAwaitTimeoutSmall = maxAwaitTimeoutSmall - 30000;
      }

      if (!txInfo) {
        log.error('waitTransaction: Transaction not found', {
          transactionHash,
          maxAwaitTimeoutSmall,
        });

        return { status: false, transactionHash, error: 'Transaction not found' };
      }

      // console.log(txInfo)

      const { from, nonce, blockNumber } = txInfo;

      let lastBlock = blockNumber;

      if (!lastBlock) {
        lastBlock = await this.web3.eth.getBlockNumber();
      }

      let txHash = transactionHash;
      let maxAwaitTime = WAIT_TIMEOUT;
      let res;

      while (!res && maxAwaitTime >= 0) {
        await sleep(5000);
        res = await this.web3.eth.getTransactionReceipt(txHash);

        if (!res) {
          try {
            // check to other tx with the same nonce
            const block = await this.web3.eth.getBlock(lastBlock, true);

            if (!!block) {
              lastBlock++;
            }

            if (!!block && !!block.transactions) {
              block.transactions.forEach(transaction => {
                if (from === transaction.from && nonce === transaction.nonce) {
                  txHash = transaction.hash;
                  if (callback) {
                    callback(transaction);
                  }
                }
              });
            }
          } catch (e) {
            log.warn('Check to other tx with the same nonce', { txHash, error: e, lastBlock });
          }
        }
        
        await sleep(AWAIT_STEP);
        maxAwaitTime = maxAwaitTime - AWAIT_STEP;
      }

      if (!res) {
        log.error('waitTransaction: Transaction not found 2', { txHash });

        return { status: false, transactionHash, error: 'Transaction not found' };
      }

      txInfo = await this.web3.eth.getTransaction(txHash);

      return { ...txInfo, ...res };
    } catch (e) {
      if (rpcErrorMessage(e)) {
        log.error('waitTransaction exception rpcErrorMessage', { transactionHash, error: e });

        await sleep(10000);

        return await this.waitTransaction(transactionHash);
      } else {
        throw e;
      }
    }
  };

  decodeApprovalLog = (receipt: TransactionReceipt) => {
    return this.web3.eth.abi.decodeLog(
      [
        { indexed: true, name: 'owner', type: 'address' },
        { indexed: true, name: 'spender', type: 'address' },
        { indexed: false, name: 'value', type: 'uint256' },
      ],
      receipt.logs[0].data,
      receipt.logs[0].topics.slice(1)
    );
  };

  decodeLockTokenLog = (receipt: TransactionReceipt): any => {
    return this.web3.eth.abi.decodeLog(
      [
        {
          indexed: true,
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
      ],
      receipt.logs[1].data,
      receipt.logs[1].topics.slice(1)
    );
  };

  decodeLockTokenOneLog = (receipt: TransactionReceipt) => {
    return this.web3.eth.abi.decodeLog(
      [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
      ],
      receipt.logs[0].data,
      receipt.logs[0].topics.slice(1)
    );
  };

  waitingBlockNumber = async (blockNumber, txHash, callbackMessage) => {
    try {
      let tx = await this.web3.eth.getTransactionReceipt(txHash);

      let maxAwaitTimeoutSmall = 2 * 60 * 1000;

      while ((!tx || !tx.blockNumber) && maxAwaitTimeoutSmall >= 0) {
        await sleep(3000);
        maxAwaitTimeoutSmall = maxAwaitTimeoutSmall - 3000;

        tx = await this.web3.eth.getTransactionReceipt(txHash);
      }

      if (!tx || !tx.blockNumber) {
        return {
          status: false,
          error: 'txHash no longer exists in the longest chain, possibly forked',
        };
      }

      const expectedBlockNumber = blockNumber + BLOCK_TO_FINALITY;

      while (true) {
        const blockNumber = await this.web3.eth.getBlockNumber();

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
    } catch (e) {
      if (rpcErrorMessage(e)) {
        log.error('waitingBlockNumber exception rpcErrorMessage', {
          blockNumber,
          txHash,
          error: e,
        });

        await sleep(10000);

        return await this.waitingBlockNumber(blockNumber, txHash, callbackMessage);
      } else {
        throw e;
      }
    }
  };

  mintToken = async (accountAddr: string, amount: number, increaseSupply = false) => {
    if (!this.web3.utils.isAddress(accountAddr)) {
      throw new Error('Invalid account address');
    }

    let res;

    if (increaseSupply) {
      res = await this.ethToken.contract.methods.increaseSupply(withDecimals(amount, 18)).send({
        from: this.ethToken.account.address,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      });

      if (res.status !== true) {
        return res;
      }
    }

    res = await this.ethToken.contract.methods
      .transfer(accountAddr, withDecimals(amount, 18))
      .send({
        from: this.ethToken.account.address,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
      });

    return res;
  };

  public isFirstValidator = async () => {
    const firstOwner = await this.ethMultiSigManager.contract.methods
      .owners(Number(process.env.MAIN_VALIDATOR_NUMBER) || 0)
      .call();
    const validatorAddress = this.ethManager.account.address;

    return firstOwner.toLowerCase() === validatorAddress.toLowerCase();
  };

  public getGasPrice = async () => {
    let defaultGasPrice = 0;
    let trackerGasPrice = 0;
    const configGasPrice = this.gasPrice || 0;

    try {
      defaultGasPrice = Number(await this.web3.eth.getGasPrice());
    } catch (e) {
      defaultGasPrice = 0;
    }

    if (this.network === NETWORK_TYPE.ETHEREUM && process.env.ETH_API_KEY) {
      try {
        const gasTracker = await axios.get<{ result: { ProposeGasPrice: string } }>(
          `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETH_API_KEY}`
        );

        trackerGasPrice = Number(gasTracker.data.result.ProposeGasPrice) * 1e9;

        trackerGasPrice = isNaN(trackerGasPrice) ? 0 : trackerGasPrice;
      } catch (e) {
        trackerGasPrice = 0;
      }
    }

    const maxGasPrice = Math.max(defaultGasPrice, trackerGasPrice, configGasPrice);

    return new BN(maxGasPrice).mul(new BN(1));
  };

  tokenDetails = async (contract: string) => {
    const erc20Contract =
      this.tokenContractsCache[contract] ||
      new this.web3.eth.Contract(erc20Json.abi as any, contract);

    this.tokenContractsCache[contract] = erc20Contract;

    const symbol = await erc20Contract.methods.symbol().call();
    let name = symbol;

    try {
      name = await erc20Contract.methods.name().call();
    } catch (e) {
      log.error('Error tokenDetails', { error: e, contract });
    }

    const decimals = await erc20Contract.methods.decimals().call();

    return [name, symbol, decimals];
  };

  tokenBalance = async (contract: string, userAddress: string) => {
    const erc20Contract =
      this.tokenContractsCache[contract] ||
      new this.web3.eth.Contract(erc20Json.abi as any, contract);

    this.tokenContractsCache[contract] = erc20Contract;

    return await erc20Contract.methods.balanceOf(userAddress).call();
  };

  nativeTokenBalance = async (userAddress: string) => {
    return await this.web3.eth.getBalance(userAddress);
  };
}
