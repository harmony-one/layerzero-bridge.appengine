import { Action } from '../Action';
import { NETWORK_TYPE, OPERATION_TYPE } from '../interfaces';
import { createError } from '../../../routes/helpers';
import { IOperationInitParams, TCreateOperationCallback } from '../Operation';
import * as hmyContract from '../../../blockchain/hmy';
import { binanceNetwork, ethNetwork, IMethods } from '../../../blockchain/eth';
// import { ethToOne, hmyToEth } from './base';
import { ethToOneERC20, hmyToEthERC20 } from './erc20';

export const generateActionsPool = async (
  params: IOperationInitParams,
  createOperationCallback: TCreateOperationCallback,
): Promise<{ actions: Array<Action>; rollbackActions: Array<Action> }> => {
  let externalNetwork: IMethods;

  switch (params.network) {
    case NETWORK_TYPE.ETHEREUM:
      // throw createError(500, 'ETHEREUM Network operations are not supported now');
      externalNetwork = ethNetwork;
      break;
    case NETWORK_TYPE.BINANCE:
      externalNetwork = binanceNetwork;
      break;
    default:
      externalNetwork = ethNetwork;
      break;
  }

  if (!externalNetwork.config.tokens.includes(params.token)) {
    throw createError(500, 'Token not support for this network');
  }

  if (params.type === OPERATION_TYPE.ONE_ETH) {
    return hmyToEthERC20(
      hmyContract.hmyMethods,
      externalNetwork.ethMethods,
      params
    );
  }

  if (params.type === OPERATION_TYPE.ETH_ONE) {
    return ethToOneERC20(
      hmyContract.hmyMethods,
      externalNetwork.ethMethods,
      params
    );
  }

  throw createError(500, 'Operation or token type not found');
};
