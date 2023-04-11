import axios from 'axios';

import { hmy } from '../../blockchain/hmy';
import { binanceNetwork, ethNetwork } from '../../blockchain/eth';
import { createError } from '../../routes/helpers';
import { NETWORK_TYPE, TOKEN } from './interfaces';
import logger from '../../logger';

const log = logger.module('validator:OperationCreate');

export const validateOneBalanceNonZero = async address => {
  const res = await hmy.blockchain.getBalance({ address });

  if (Number(res.result) === 0) {
    throw createError(500, 'User one balance is to low');
  }
};

export const validateEthBalanceNonZero = (ethAddress: string, network: NETWORK_TYPE) => {
  return new Promise((resolve, reject) => {
    console.log(111, ethAddress);
    const externalNetwork = network === NETWORK_TYPE.BINANCE ? binanceNetwork : ethNetwork;

    externalNetwork.web3.eth.getBalance(ethAddress, (err, balance) => {
      console.log(2222, err, balance);

      if (err) {
        log.error('validateEthBalanceNonZero', { err, ethAddress, balance });

        return reject(false);
      }

      if (!Number(balance)) {
        log.error('validateEthBalanceNonZero', { err, ethAddress, balance });

        return reject(false);
      }

      resolve(Number(balance));
    });
  });
};

export const getTokenPrice = async (tokenSymbol: string) => {
  let usdPrice = 0;

  try {
    const res = await axios.get<{ lastPrice: number }>(
      `https://api.binance.com/api/v1/ticker/24hr?symbol=${tokenSymbol}USDT`
    );

    usdPrice = res.data.lastPrice;
  } catch (e) {
    // log.error('get usdPrice api binance', { error: e, token });
  }

  if (!Number(usdPrice)) {
    try {
      const res = await axios.get<{ USD: number; USDT: number }>(
        `https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USDT&tsyms=USD`
      );

      usdPrice = res.data.USD || res.data.USDT;
    } catch (e) {
      log.error('get usdPrice cryptocompare', { error: e, tokenSymbol });
    }
  }

  return usdPrice;
};

export const getTokenUSDPrice = (token: TOKEN, erc20Address?: string) => {
  return new Promise(async (resolve, reject) => {
    let usdPrice = 0;

    switch (token) {
      case TOKEN.BUSD:
        try {
          usdPrice = await getTokenPrice('BUSD');
        } catch (e) {}
        break;

      case TOKEN.ONE:
        try {
          usdPrice = await getTokenPrice('ONE');
        } catch (e) {}
        break;

      case TOKEN.LINK:
        try {
          usdPrice = await getTokenPrice('LINK');
        } catch (e) {}
        break;

      case TOKEN.ERC20:
        if (erc20Address) {
          try {
            const [name, symbol, decimals] = await ethNetwork.ethMethods.tokenDetails(
              erc20Address
            );
            if (symbol) {
              usdPrice = await getTokenPrice(symbol);
            }
          } catch (e) {}
        }
        break;
    }

    resolve(usdPrice);
  });
};

const DEPOSIT_AMOUNT_CACHE = {
  [NETWORK_TYPE.BINANCE]: 0,
  [NETWORK_TYPE.ETHEREUM]: 0,
};

const PRICE_RATIO_CACHE = {
  'ETH_ONE': 0,
  'BNB_ONE': 0,
};

const GAS_PRICE_CACHE = {
  'ETH': 0,
  'BNB': 0,
};

const loadDepositAmount = async () => {
  try {
    const currentGasPrice = await ethNetwork.ethMethods.getGasPrice();

    const ethPrice = await getTokenPrice('ETH');
    const onePrice = await getTokenPrice('ONE');

    PRICE_RATIO_CACHE['ETH_ONE'] = ethPrice / onePrice;
    GAS_PRICE_CACHE['ETH'] = Number(currentGasPrice);

    DEPOSIT_AMOUNT_CACHE[NETWORK_TYPE.ETHEREUM] = Number(
      ((400000 * Number(currentGasPrice) * ethPrice) / onePrice / 1e18).toFixed(0)
    );
  } catch (e) {
    log.error('loadDepositAmount Ethereum', { error: e });
  }

  try {
    const currentGasPrice = await binanceNetwork.web3.eth.getGasPrice();

    const bnbPrice = await getTokenPrice('BNB');
    const onePrice = await getTokenPrice('ONE');

    PRICE_RATIO_CACHE['BNB_ONE'] = bnbPrice / onePrice;
    GAS_PRICE_CACHE['BNB'] = parseFloat(currentGasPrice);

    DEPOSIT_AMOUNT_CACHE[NETWORK_TYPE.BINANCE] = Number(
      ((380000 * Number(currentGasPrice) * bnbPrice) / onePrice / 1e18).toFixed(0),
    );
  } catch (e) {
    log.error('loadDepositAmount Binance', { error: e });
  }
};

const CHECK_INTERVAL = Number(process.env.ETH_CHECK_EVENTS_INTERVAL);

// setInterval(loadDepositAmount, CHECK_INTERVAL);
// loadDepositAmount();

export const getDepositAmount = async (network: NETWORK_TYPE) => {
  return DEPOSIT_AMOUNT_CACHE[network];
};

export const getOneByETHGasFee = (ethGas: number) => {
  return ethGas * GAS_PRICE_CACHE['ETH'] * PRICE_RATIO_CACHE['ETH_ONE'] / 1e18;
};

export const getEthByETHGasFee = (ethGas: number) => {
  return ethGas * GAS_PRICE_CACHE['ETH'] / 1e18;
};

const blackList = [
  '0x367f53d48dc272c1aa5344ee7d8ef53c0ab05a30',
  '0xb23d916f1f9b105454278e9ff6de80127a19b77d',
  '0x2dd38d560ea6abb9fd3569ee1dee5f439d898b10',
  '0xfbe47074d6a20b7abb01b114a2281ff6ecf489f2',
  '0xded5300a6341be434d83e6b2f6a74d8ac7e89029',
  '0x9cd69969740c8db9800a24bdd6edf10fe0de965a',
  '0xaa620bf7e59b44ae428f7eddfad5162f3737774d',
  '0x34f95a019cdd56450dc066c46e3c110ee224db53',
  '0x1b3aea9c3e7ae5684f9a83ee560f46818c5b9021'
];

export const isAddressInBlackList = (address: string) => {
  const addrHex = hmy.crypto.getAddress(address).checksum;

  return blackList.some(addr => addr.toLowerCase() === addrHex.toLowerCase());
};

export const validateOneBalanceNonZeroEx = async address => {
  const res = await hmy.blockchain.getBalance({ address });

  log.info('validateOneBalanceNonZeroEx', { res });

  if (Number(res.result) === 0) {
    throw createError(500, 'User one balance is to low');
  }

  return res.result;
};

