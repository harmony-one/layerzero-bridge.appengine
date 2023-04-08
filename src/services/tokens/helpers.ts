import { BigNumber } from 'bignumber.js';
const BN = require('bn.js');

export const divDecimals = (amount: string | number, decimals: string | number) => {
  if (!decimals) {
    return new BigNumber(amount).toFixed();
  }

  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).dividedBy(decimalsMul);

  return amountStr.toFixed();
};

export const mulDecimals = (
  amount: string | number,
  decimals: string | number,
) => {
  if (!Number(decimals)) {
    return new BN(amount);
  }

  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).multipliedBy(decimalsMul);

  return amountStr.toFixed();
};

export const sumAmounts = (amount1: number, amount2: number) => {
  return new BigNumber(amount1).plus(amount2).toFixed();
};