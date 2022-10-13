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
