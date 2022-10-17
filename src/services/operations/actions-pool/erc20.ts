import * as hmyContract from '../../../blockchain/hmy';
import { hmy } from '../../../blockchain/hmy';
import { getHmyTransactionByHash } from '../../../blockchain/hmy/helpers'
import * as ethContract from '../../../blockchain/eth';
import { IOperationInitParams } from '../Operation';
import { Action } from '../Action';
import { ACTION_TYPE } from '../interfaces';
import logger from '../../../logger';
import axios from 'axios';

const log = logger.module('validator:Erc20ActionPool');

const getCheckSum = addr => hmy.crypto.getAddress(addr).checksum;

export const ethToOneERC20 = (
  hmyMethods: hmyContract.HmyMethodsBase,
  ethMethods: ethContract.EthMethods,
  params: IOperationInitParams,
) => {
  const approveEthMangerAction = new Action({
    type: ACTION_TYPE.approveEthManger,
    awaitConfirmation: true,
    isRequired: false,
    callFunction: async hash => await ethMethods.waitTransaction(hash),
  });

  const lockTokenAction = new Action({
    type: ACTION_TYPE.lockToken,
    awaitConfirmation: true,
    callFunction: async hash => await ethMethods.waitTransaction(hash),
  });

  const waitingBlockNumberAction = new Action({
    type: ACTION_TYPE.waitingBlockNumber,
    callFunction: () =>
      ethMethods.waitingBlockNumber(
        lockTokenAction.payload.blockNumber,
        lockTokenAction.payload.transactionHash,
        msg => (waitingBlockNumberAction.message = msg)
      ),
  });

  const mintTokenAction = new Action({
    type: ACTION_TYPE.mintToken,
    callFunction: async () => {
      const hash = lockTokenAction.payload.transactionHash;

      let status;

      while (status != "DELIVERED") {
        const res = await axios.get(`https://api-mainnet.layerzero-scan.com/tx/${hash}`);

        const lz = res.data?.messages[0] || {};

        status = lz.status;

        if (status === "DELIVERED") {
          return {
            status: true,
            transactionHash: hash,
            link: `https://layerzeroscan.com/${lz.srcChainId}/address/${lz.srcUaAddress}/message/${lz.dstChainId}/address/${lz.dstUaAddress}/nonce/${lz.srcUaNonce}`
          }
        }

        if (status === "ERROR") {
          throw new Error('Layer zero delivery error');
        }
      }
    },
  });

  return {
    actions: [
      approveEthMangerAction,
      lockTokenAction,
      waitingBlockNumberAction,
      mintTokenAction,
    ],
    rollbackActions: []
  };
};

export const hmyToEthERC20 = (
  hmyMethods: hmyContract.HmyMethodsBase,
  ethMethods: ethContract.EthMethods,
  params: IOperationInitParams
) => {
  const approveHmyMangerAction = new Action({
    type: ACTION_TYPE.approveHmyManger,
    awaitConfirmation: true,
    isRequired: false,
    callFunction: hash => hmyMethods.getTransactionReceipt(hash),
  });

  const burnTokenAction = new Action({
    type: ACTION_TYPE.burnToken,
    awaitConfirmation: true,
    callFunction: hash => hmyMethods.getTransactionReceipt(hash),
  });

  // const waitingBlockNumberAction = new Action({
  //   type: ACTION_TYPE.waitingBlockNumberHarmony,
  //   callFunction: () =>
  //     hmyMethods.waitingBlockNumber(
  //       Number(burnTokenAction.payload.blockNumber),
  //       burnTokenAction.payload.transactionHash,
  //       msg => (waitingBlockNumberAction.message = msg)
  //     ),
  // });

  // https://api-mainnet.layerzero-scan.com/tx/0x78f4ab18c13aefef10c15eab2e1b2122fecd4b70b6bf7ca1f207e07694340737

  const unlockTokenAction = new Action({
    type: ACTION_TYPE.unlockToken,
    callFunction: async () => {
      let status;

      while (status != "DELIVERED") {
        const tx = await getHmyTransactionByHash(burnTokenAction.payload.transactionHash);

        const hash = tx.ethHash;

        const res = await axios.get(`https://api-mainnet.layerzero-scan.com/tx/${hash}`);

        const lz = res.data?.messages[0] || {};

        status = lz.status;

        if (status === "DELIVERED") {
          return {
            status: true,
            transactionHash: hash,
            link: `https://layerzeroscan.com/${lz.srcChainId}/address/${lz.srcUaAddress}/message/${lz.dstChainId}/address/${lz.dstUaAddress}/nonce/${lz.srcUaNonce}`
          }
        }

        if (status === "ERROR") {
          throw new Error('Layer zero delivery error');
        }
      }
    },
  });

  return {
    actions: [approveHmyMangerAction, burnTokenAction, unlockTokenAction],
    rollbackActions: []
  };
};
