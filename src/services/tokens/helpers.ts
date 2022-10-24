import { BigNumber } from 'bignumber.js';

export const divDecimals = (amount: string | number, decimals: string | number) => {
  if (!decimals) {
    return new BigNumber(amount).toFixed();
  }

  const decimalsMul = `10${new Array(Number(decimals)).join('0')}`;
  const amountStr = new BigNumber(amount).dividedBy(decimalsMul);

  return amountStr.toFixed();
};

export const sumAmounts = (amount1: number, amount2: number) => {
  return new BigNumber(amount1).plus(amount2).toFixed();
};