import { BigNumber } from 'bignumber.js';
import { Operation } from './Operation';
// import { binanceNetwork, ethNetwork } from '../../blockchain/eth';
// import { hmy } from '../../blockchain/hmy';
// import { NETWORK_TYPE } from './interfaces';

export const mulDecimals = (amount, decimals) => {
  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).multipliedBy(decimalsMul);

  return amountStr.toFixed();
};

export const searchInOperation = (search: string, operation: Operation): boolean => {
  if (operation.amount === search) {
    return true;
  }

  if (
    operation.actions.some(
      a => a.transactionHash && a.transactionHash.toLowerCase().includes(search.toLowerCase())
    )
  ) {
    return true;
  }

  if (operation.ethAddress && operation.ethAddress.toLowerCase().includes(search.toLowerCase())) {
    return true;
  }

  if (operation.oneAddress && operation.oneAddress.toLowerCase().includes(search.toLowerCase())) {
    return true;
  }

  if (operation.id && operation.id.toLowerCase().includes(search.toLowerCase())) {
    return true;
  }

  if (operation.parentId && operation.parentId.toLowerCase().includes(search.toLowerCase())) {
    return true;
  }

  return false;
};

// export const needTopUpAccount = async (operation: Operation): Promise<boolean> => {
//   const address = hmy.crypto.getAddress(operation.oneAddress).bech32;

//   const res = await hmy.blockchain.getBalance({ address });

//   if (Number(res.result) !== 0) {
//     return false;
//   }

//   let isFirstValidator = false;

//   switch (operation.network) {
//     case NETWORK_TYPE.BINANCE:
//       isFirstValidator = await binanceNetwork.ethMethodsERC20.isFirstValidator();
//       break;
//     case NETWORK_TYPE.ETHEREUM:
//       isFirstValidator = await ethNetwork.ethMethodsERC20.isFirstValidator();
//       break;
//     default:
//       isFirstValidator = await ethNetwork.ethMethodsERC20.isFirstValidator();
//   }

//   if (!isFirstValidator) {
//     return false;
//   }

//   return true;
// };
