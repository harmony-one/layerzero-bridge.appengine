import axios from 'axios';
import logger from '../../logger';
const log = logger.module('validator:tokensPrices');

export class TokenPrices {
  private priceCache = {};

  private lastPriceUpdate = 0;

  private coinGeckoTokens: Array<{
    id: string;
    name: string;
    symbol: string;
  }> = [];

  constructor() {
    this.initCoinGecko();
  }

  initCoinGecko = async () => {
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/coins/list');
      this.coinGeckoTokens = res.data;
    } catch(e) {}
  };

  getTokenPrice = async (symbol: string) => {
    let usdPrice = 0;

    // if (Date.now() - this.lastPriceUpdate < 1000 * 60 * 20 && this.priceCache[symbol]) {
    //   return this.priceCache[symbol];
    // }

    try {
      const res = await axios.get<{ lastPrice: number }>(
        `https://api.binance.com/api/v1/ticker/24hr?symbol=${symbol}USDT`
      );

      usdPrice = res.data.lastPrice;
    } catch (e) {
      // log.error('get usdPrice api binance', { error: e, token });
    }

    if (!Number(usdPrice)) {
      try {
        let coingeckoToken;

        switch (symbol.toLowerCase()) {
          case 'fox':
            coingeckoToken = 'fox-finance';
            break;

          default:
            coingeckoToken = this.coinGeckoTokens.find(t => t.symbol === symbol.toLowerCase());
        }

        if (coingeckoToken) {
          const res = await axios.get<{ USD: number; USDT: number }>(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoToken.id}&vs_currencies=usd`
          );

          usdPrice = res.data[coingeckoToken.id].usd;
        }
      } catch (e) {}
    }

    // if (!Number(usdPrice)) {
    //   try {
    //     const res = await axios.get<{ USD: number; USDT: number }>(
    //       `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USDT&tsyms=USD`
    //     );
    //
    //     usdPrice = res.data.USD || res.data.USDT;
    //   } catch (e) {
    //     // log.error('get usdPrice cryptocompare', { error: e, symbol });
    //   }
    // }

    if (usdPrice) {
      this.priceCache[symbol] = usdPrice;
      this.lastPriceUpdate = Date.now();
      return usdPrice;
    }

    return this.priceCache[symbol] || 0;
  };
}

export const tokenPrices = new TokenPrices();