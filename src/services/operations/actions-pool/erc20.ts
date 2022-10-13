import * as hmyContract from '../../../blockchain/hmy';
import { hmy } from '../../../blockchain/hmy';
import * as ethContract from '../../../blockchain/eth';
import { IOperationInitParams } from '../Operation';
import { Action } from '../Action';
import { ACTION_TYPE } from '../interfaces';
import logger from '../../../logger';

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
    callFunction: async hash => await ethMethods.waitTransaction(hash),
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

  const unlockTokenAction = new Action({
    type: ACTION_TYPE.unlockToken,
    callFunction: hash => hmyMethods.getTransactionReceipt(hash),
  });

  return {
    actions: [approveHmyMangerAction, burnTokenAction, unlockTokenAction],
    rollbackActions: []
  };
};
