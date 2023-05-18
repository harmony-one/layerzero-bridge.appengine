import axios from 'axios';
import { NETWORK_TYPE } from 'bridge-sdk';
import { findTokenConfig } from '../../tokens/config';
import { mulDecimals } from '../helpers';
import { OPERATION_TYPE } from '../interfaces';
import { IOperationInitParams } from '../Operation';

export const getClearOperationParams = (params: IOperationInitParams) => {
  return {
    id: params.id,
    oneAddress: params.oneAddress,
    ethAddress: params.ethAddress,
    network: params.network,
    type: params.type,
    tokenType: params.tokenType,
    amount: params.amount,
    timestamp: params.timestamp,
  };
};

export const getLzEvents = async (params: IOperationInitParams) => {
  const tokenConfig = findTokenConfig({
    erc20Address: params.erc20Address,
    hrc20Address: params.hrc20Address,
    network: params.network
  })

  let res;

  try {
    res = await axios.get('https://harmony-lz-events.fly.dev/tracker/events', {
      params: {
        chain: params.type === OPERATION_TYPE.ETH_ONE ?
          'hmy' :
          params.network === NETWORK_TYPE.BINANCE ? 'bsc' : 'eth',
        from: params.type === OPERATION_TYPE.ETH_ONE ? params.ethAddress : params.oneAddress,
        to: params.type === OPERATION_TYPE.ETH_ONE ? params.oneAddress : params.ethAddress,
        dstUaAddress: params.type === OPERATION_TYPE.ETH_ONE ? tokenConfig.proxyHRC20 : tokenConfig.proxyERC20,
        amount: mulDecimals(params.amount, tokenConfig.decimals)
      }
    });
  } catch (e) {
    res = { data: [] };
  }

  return {
    ...res.data[0],
    status: res.data[0] ? "DELIVERED" : 'NONE'
  }
}
