import { DBService } from '../database';
import logger from '../../logger';
import { divDecimals } from './helpers';
import { binanceNetwork, ethNetwork } from '../../blockchain/eth';
import { web3Hmy } from '../../blockchain/hmy';
import { OperationService } from '../operations';
import { getConfig } from '../../configs';
import { tokenPrices } from './TokenPrices';
import { tokensConfigs, ITokenInfo as ITokenConfigInfo, NETWORK_TYPE } from './config';
import { TOKEN } from 'bridge-sdk';
const log = logger.module('validator:tokensService');

const config = getConfig();

export interface IOperationService {
    database: DBService;
    operations: OperationService;
}

export interface ITokenInfo {
    name: string;
    symbol: string;
    decimals?: string;
    erc20Address: string;
    hrc20Address: string;
    totalLocked: string;
    usdPrice: number;
}

const GET_TOTAL_LOCKED_INTERVAL = 120000;
// const SAVE_ASSETS_INTERVAL = 1000 * 60 * 30;

export class Tokens {
    private database: DBService;
    private dbCollectionName = 'assetsHistory';

    private tokens: ITokenInfo[] = [];
    private lastUpdateTime = Date.now();

    private symbolsMap = {
        WETH: 'ETH',
        '1ETH': 'ETH',
        '1ONE': 'ONE',
        MCC: 'MulletCoinClub',
    };

    constructor(params: IOperationService) {
        this.database = params.database;

        this.getTotalLocked();
    }

    getTotalLocked = async () => {
        try {
            this.tokens = await this.getTotalLockedByType(tokensConfigs);
            this.lastUpdateTime = Date.now();
        } catch (e) {
            console.error(e);
        }

        setTimeout(this.getTotalLocked, GET_TOTAL_LOCKED_INTERVAL);
    };

    getTotalLockedByType = async (tokens: ITokenConfigInfo[]) => {
        const newTokens = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const { decimals } = token;

            let totalLocked = 0;

            try {
                if (token.type === TOKEN.ETH) {
                    if (token.network === NETWORK_TYPE.BINANCE) {
                        totalLocked = Number(
                            await binanceNetwork.ethMethods.nativeTokenBalance(token.proxyERC20)
                        );
                    } else {
                        totalLocked = Number(
                            await ethNetwork.ethMethods.nativeTokenBalance(token.proxyERC20)
                        );
                    }
                } else if (token.type === TOKEN.ONE) {
                    totalLocked = Number(
                        await web3Hmy.eth.getBalance(token.proxyHRC20)
                    );
                } else {
                    if (token.network === NETWORK_TYPE.BINANCE) {
                        totalLocked = await binanceNetwork.ethMethods.tokenBalance(
                            token.erc20Address, token.proxyERC20
                        );
                    } else {
                        totalLocked = await ethNetwork.ethMethods.tokenBalance(
                            token.erc20Address, token.proxyERC20
                        );
                    }
                }
            } catch (e) {
                log.error('get totalSupply', { error: e, token });
                // return;
            }

            let usdPrice = 0, totalLockedNormal = '', totalLockedUSD = 0;

            try {
                usdPrice = await tokenPrices.getTokenPrice(this.symbolsMap[token.symbol] || token.symbol);

                totalLockedNormal = divDecimals(totalLocked, decimals);

                totalLockedUSD = Number(totalLockedNormal) * Number(usdPrice);
            } catch (e) {
                // nop
            }

            newTokens.push({
                ...token,
                totalSupply: String(totalLocked),
                totalLockedNormal: totalLockedNormal,
                totalLockedUSD: totalLockedUSD,
                usdPrice,
                type: token.token, // support previous frontend version
                token: token.token,
            });
        }

        return newTokens;
    };

    getAllTokens = (params: { size: number; page: number }) => {
        const from = params.page * params.size;
        const to = (params.page + 1) * params.size;
        const paginationData = this.tokens.slice(from, Math.min(to, this.tokens.length));

        return {
            content: paginationData,
            totalElements: this.tokens.length,
            totalPages: Math.ceil(this.tokens.length / params.size),
            size: params.size,
            page: params.page,
            lastUpdateTime: this.lastUpdateTime,
        };
    };
}