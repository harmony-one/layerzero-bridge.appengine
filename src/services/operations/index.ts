import moment from 'moment';

import { DBService } from '../database';
import { IOperationInitParams, Operation } from './Operation';
import { createError } from '../../routes/helpers';
import { ACTION_TYPE, NETWORK_TYPE, OPERATION_TYPE, STATUS, TOKEN, TOKEN_TYPE } from './interfaces';
import { hmy } from '../../blockchain/hmy';
import { normalizeEthKey } from '../../blockchain/utils';
import {
  getDepositAmount,
  getOneByETHGasFee,
  getTokenUSDPrice,
  // validateEthBalanceNonZero,
  validateOneBalanceNonZero,
} from './validations';
import logger from '../../logger';
import { searchInOperation } from './helpers';

const log = logger.module('validator:OperationService');

export interface IOperationService {
  database: DBService;
}

const CHECK_STUCK_INTERVAL = 60 * 1000;

const CACHE_LIMIT = Number(process.env.CACHE_LIMIT) || 2000;

export class OperationService {
  database: DBService;

  dbCollectionName = 'operations';

  operations: Operation[] = [];

  constructor(params: IOperationService) {
    this.database = params.database;

    this.restoreOperationsFromDB();

    this.checkStuckOperations();
  }

  checkStuckOperations = async () => {
    try {
      const stuckOperations = this.getAllOperations(
        { page: 0, size: 1000, stuck: true, stuckTime: 21 },
        true
      );

      const operations = stuckOperations.content.filter(o => {
        const wasRestarted = isNaN(o.wasRestarted) ? 0 : Number(o.wasRestarted);

        return (
          wasRestarted < 3 &&
          (o.type === OPERATION_TYPE.ETH_ONE ||
            (o.type === OPERATION_TYPE.ONE_ETH && o.network === NETWORK_TYPE.BINANCE))
        );
      });

      for (let i = 0; i < operations.length; i++) {
        await this.resetOperation(String(operations[i].id));
      }
    } catch (e) {
      log.error('checkStuckOperations error', { error: e });
    }

    setTimeout(this.checkStuckOperations, CHECK_STUCK_INTERVAL);
  };

  restoreOperationsFromDB = async (id?: string) => {
    const operations: Operation[] = await this.database.getCollectionDataWithLimit(
      this.dbCollectionName,
      'timestamp',
      CACHE_LIMIT
    );

    // const notWaiting = (o: Operation) => {
    //   return (
    //     Date.now() - o.timestamp * 1000 < 3 * 60 * 1000 ||
    //     ![STATUS.IN_PROGRESS, STATUS.WAITING].includes(o.status) ||
    //     o.actions.some(a => a.status !== STATUS.WAITING)
    //   );
    // };

    operations
      .filter(o => (id ? o.id === id : true))
      // .filter(o => (!id ? notWaiting(o) : true))
      .forEach(async operationDB => {
        const operation = new Operation();

        await operation.asyncConstructor(
          { ...operationDB, operationService: this },
          this.saveOperationToDB,
          this.createSubOperation
        );

        this.operations.push(operation);
      });
  };

  saveOperationToDB = async (operation: Operation) => {
    await this.database.updateDocument(
      this.dbCollectionName,
      operation.id,
      operation.toObject({ payload: true })
    );
  };

  validateOperationBeforeCreate = async (params: IOperationInitParams) => {
    const normalizeOne = v => hmy.crypto.getAddress(v).checksum;

    if (this.operations.some(o => o.id === params.id)) {
      throw createError(500, 'This operation already in progress');
    }

    if (params.type === OPERATION_TYPE.ONE_ETH) {
      const DAY = 1000 * 60 * 60 * 24;

      const userTxs = this.operations.filter(
        o =>
          Date.now() - DAY < o.timestamp &&
          o.type === OPERATION_TYPE.ONE_ETH &&
          o.oneAddress === params.oneAddress &&
          [STATUS.SUCCESS, STATUS.IN_PROGRESS, STATUS.WAITING].includes(o.status)
      );

      if (userTxs.length >= 5) {
        throw createError(
          500,
          'You have reached the limit of transfers from Harmony to Ethereum (5 transfers within 24 hours)'
        );
      }
    }

    if (
      this.operations.some(
        op =>
          normalizeEthKey(op.ethAddress) === normalizeEthKey(params.ethAddress) &&
          normalizeOne(op.oneAddress) === normalizeOne(params.oneAddress) &&
          op.type === params.type &&
          op.token === params.token &&
          (op.status === STATUS.IN_PROGRESS || op.status === STATUS.WAITING) &&
          Date.now() - op.timestamp * 1000 < 1000 * 120 // 120 sec
      )
    ) {
      throw createError(500, 'This operation already in progress');
    }

    try {
      switch (params.type) {
        case OPERATION_TYPE.ONE_ETH:
          await validateOneBalanceNonZero(params.oneAddress);
          break;
        case OPERATION_TYPE.ETH_ONE:
          // if (!AUTO_CREATE_TOKENS.includes(params.erc20Address?.toLowerCase())) {
          //   await validateEthBalanceNonZero(params.ethAddress, params.network);
          // }
          break;
        default:
          throw createError(400, 'Invalid operation type');
      }
    } catch (e) {
      switch (params.type) {
        case OPERATION_TYPE.ONE_ETH:
          throw createError(500, 'You need ONE tokens for covering the ethereum tx fee');
        case OPERATION_TYPE.ETH_ONE:
          throw createError(500, 'User eth balance is to low');
      }
      throw createError(500, 'User eth balance is to low');
    }

    if (params.type === OPERATION_TYPE.ONE_ETH) {
      const tokenPrice = await getTokenUSDPrice(params.token, params.erc20Address);

      if (
        tokenPrice &&
        Number(tokenPrice) * Number(params.amount) < Number(process.env.MIN_AMOUNT_USD)
      ) {
        throw createError(500, `Minimum amount must be more than $${process.env.MIN_AMOUNT_USD}`);
      }
    }

    if (params.token === TOKEN.ERC20 && !params.erc20Address) {
      throw createError(500, `Bad erc20Address for ERC20 operation`);
    }

    return true;
  };

  createSubOperation = async (parentId: string, erc20Address: string, amount: string) => {
    const parentOperation = this.operations.find(o => o.id === parentId);

    if (parentOperation) {
      const operation = new Operation();

      const parentOperationObj = parentOperation.toObject({ payload: true });

      const actions: any = parentOperationObj.actions.map(a => {
        return {
          ...a,
          payload: {},
          transactionHash: a.type === ACTION_TYPE.mintToken ? '' : a.transactionHash,
          status: STATUS.WAITING,
        };
      });

      await operation.asyncConstructor(
        {
          id: `${parentOperation.id}-sub`,
          parentId: parentOperation.id,
          status: STATUS.IN_PROGRESS,
          actions,
          type: parentOperation.type,
          erc20Address: erc20Address,
          hrc20Address: '',
          token: parentOperation.token,
          tokenType: TOKEN_TYPE.SUB,
          network: parentOperation.network,
          ethAddress: parentOperation.ethAddress,
          oneAddress: parentOperation.oneAddress,
          amount: amount,
          timestamp: Math.round(+new Date() / 1000),
          operationService: this,
        },
        this.saveOperationToDB,
        this.createSubOperation
      );

      await this.saveOperationToDB(operation);

      this.operations.push(operation);
    } else {
      log.error('Parent operation not found', { parentId, erc20Address });
    }
  };

  resetOperationFromDB = async (id: string) => {
    this.operations = this.operations.filter(o => o.id !== id);

    await this.restoreOperationsFromDB(id);
  };

  resetOperation = async (id: string) => {
    const operation = this.operations.find(o => o.id === id);

    if (operation) {
      const newOperationObj: any = operation.toObject({ payload: true });

      newOperationObj.status = STATUS.IN_PROGRESS;
      newOperationObj.wasRestarted = newOperationObj.wasRestarted
        ? Number(newOperationObj.wasRestarted) + 1
        : 1;

      newOperationObj.actions = newOperationObj.actions.map(a => ({
        ...a,
        // status: a.type === ACTION_TYPE.topUpAccount ? a.status : STATUS.WAITING,
        status: STATUS.WAITING,
      }));

      this.operations = this.operations.filter(o => o.id !== id);

      const newOperation = new Operation();

      await newOperation.asyncConstructor(
        { ...newOperationObj, operationService: this },
        this.saveOperationToDB,
        this.createSubOperation
      );

      this.operations.push(newOperation);

      return newOperation.toObject();
    } else {
      throw createError(404, 'Operation not found');
    }
  };

  create = async (params: IOperationInitParams) => {
    await this.validateOperationBeforeCreate(params);

    const operation = new Operation();

    await operation.asyncConstructor(
      {
        id: params.id,
        type: params.type,
        erc20Address: params.erc20Address,
        hrc20Address: params.hrc20Address,
        token: params.token,
        network: params.network,
        ethAddress: params.ethAddress,
        oneAddress: params.oneAddress,
        amount: params.amount,
        operationService: this,
      },
      this.saveOperationToDB,
      this.createSubOperation
    );

    await this.saveOperationToDB(operation);

    this.operations.push(operation);

    if (this.operations.length > CACHE_LIMIT) {
      this.removeLastOperationFromCache();
    }

    return operation.toObject();
  };

  removeLastOperationFromCache = () => {
    // this.operations = this.operations.slice(100);
  };

  getOperationById = (id: string) => {
    const operation = this.operations.find(operation => operation.id === id);

    if (operation) {
      return operation.toObject();
    }

    return null;
  };

  setActionHash = async (
    params: {
      operationId: string;
      actionType: ACTION_TYPE;
      transactionHash: string;
    },
    admin = false
  ) => {
    const operation = this.operations.find(o => o.id === params.operationId);

    if (!operation) {
      throw createError(400, 'Operation not found');
    }

    if (!params.transactionHash) {
      throw createError(500, 'Wrong transactionHash');
    }

    const action = operation.actions.find(a => a.type === params.actionType);

    if (!action) {
      throw createError(400, 'Action not found');
    }

    /* check transactionHash to unique */
    const isNotUnique = this.operations.some(o =>
      o.actions.some(
        a =>
          a.type === params.actionType &&
          a.transactionHash &&
          a.transactionHash !== 'skip' &&
          a.transactionHash.toUpperCase() === params.transactionHash.toUpperCase()
      )
    );

    if (!admin && isNotUnique) {
      throw createError(500, 'Transaction hash already used');
    }

    action.setTransactionHash(params.transactionHash, admin);

    await this.saveOperationToDB(operation);

    return operation.toObject();
  };

  getTokenUSDPrice = (token: TOKEN, erc20Address?: string) => {
    return getTokenUSDPrice(token, erc20Address);
  };

  getDepositAmount = (network: NETWORK_TYPE) => getDepositAmount(network);
  getOneByETHGasFee = (ethGas: number) => getOneByETHGasFee(ethGas);

  checkToStuck = (operation: Operation, time = 50) => {
    if ([STATUS.SUCCESS, STATUS.CANCELED].includes(operation.status)) {
      return false;
    }

    if (
      operation.status === STATUS.IN_PROGRESS &&
      operation.timestamp &&
      (Date.now() - operation.timestamp * 1000) / (1000 * 60) > 61
    ) {
      return true;
    }

    let actionType: ACTION_TYPE;

    switch (operation.token) {
      case TOKEN.ONE:
        actionType =
          operation.type === OPERATION_TYPE.ETH_ONE
            ? ACTION_TYPE.unlockHRC20Token
            : ACTION_TYPE.mintHRC20Token;
        break;

      default:
        actionType =
          operation.type === OPERATION_TYPE.ETH_ONE
            ? ACTION_TYPE.mintToken
            : ACTION_TYPE.unlockToken;
        break;
    }

    const action = operation.actions.find(a => a.type === actionType);

    if (action) {
      if (action.status === STATUS.ERROR) {
        return true;
      }

      if (action.timestamp && (Date.now() - action.timestamp * 1000) / (1000 * 60) > time) {
        return true;
      }
    }

    return false;
  };

  hasStuck = () => {
    return this.getAllOperations({ stuck: true, size: 1000, page: 0 }).content.length;
  };

  getAllOperationFullHistory = async (params: {
    ethAddress?: string | string[];
    oneAddress?: string | string[];
    transactionHash?: string;
    amount?: string;
    status?: STATUS;
    type?: OPERATION_TYPE;
    token?: TOKEN;
    network?: NETWORK_TYPE;
    search?: string;
    size: number;
    page: number;
  }) => {
    const operationRef = this.database.db.collection(this.dbCollectionName);

    let query = operationRef.where('timestamp', '!=', 0);

    if (params.status) {
      query = query.where('status', '==', params.status);
    }

    if (Array.isArray(params.ethAddress)) {
      query = query.where('ethAddress', 'in', params.ethAddress);
    }

    if (Array.isArray(params.oneAddress)) {
      query = query.where('oneAddress', 'in', params.oneAddress);
    }

    if (!!params.ethAddress && typeof params.ethAddress === 'string') {
      query = query.where('ethAddress', '==', params.ethAddress);
    }

    if (!!params.oneAddress && typeof params.oneAddress === 'string') {
      query = query.where('oneAddress', '==', params.oneAddress);
    }

    if (params.type) {
      query = query.where('type', '==', params.type);
    }

    if (params.network) {
      query = query.where('network', '==', params.network);
    }

    if (params.token) {
      query = query.where('token', '==', params.token);
    }

    if (params.amount) {
      query = query.where('amount', '==', params.amount);
    }

    const snapshot = await query
      .orderBy('timestamp', 'desc')
      .limit(params.size)
      .offset(params.page * params.size)
      .get();

    const items = snapshot.docs.map(doc => doc.data());

    return {
      params,
      content: items,
      totalElements: snapshot.size,
      totalPages: Math.ceil(items.length / params.size),
      size: params.size,
      page: params.page,
    };
  };

  getAllOperations = (
    params: {
      ethAddress?: string;
      oneAddress?: string;
      transactionHash?: string;
      amount?: string;
      status?: STATUS;
      type?: OPERATION_TYPE;
      token?: TOKEN;
      network?: NETWORK_TYPE;
      search?: string;
      stuck: boolean;
      size: number;
      page: number;
      stuckTime?: number;
    },
    admin = false
  ) => {
    const filteredData = this.operations
      .filter(o => !!o.timestamp)
      .filter(o =>
        params.status && params.status === STATUS.CANCELED ? true : o.status !== STATUS.CANCELED
      )
      .filter(operation => {
        const hasEthAddress = params.ethAddress ? params.ethAddress === operation.ethAddress : true;
        const hasOneAddress = params.oneAddress ? params.oneAddress === operation.oneAddress : true;
        const hasStatus = params.status ? params.status === operation.status : true;
        const hasType = params.type ? params.type === operation.type : true;
        const hasNetwork = params.network ? params.network === operation.network : true;
        const hasToken = params.token ? params.token === operation.token : true;
        const hasAmount = params.amount ? params.amount === operation.amount : true;
        const hasTransaction = params.transactionHash
          ? operation.actions.some(
              a =>
                a.transactionHash &&
                a.transactionHash.toLowerCase() === params.transactionHash.toLowerCase()
            )
          : true;

        const hasSearch = params.search ? searchInOperation(params.search, operation) : true;

        return (
          hasEthAddress &&
          hasOneAddress &&
          hasNetwork &&
          hasStatus &&
          hasType &&
          hasToken &&
          hasAmount &&
          hasSearch &&
          hasTransaction &&
          (params.stuck ? this.checkToStuck(operation, params.stuckTime) : true)
        );
      });

    const sortedData = filteredData.sort((a, b) => {
      return moment(a.timestamp).isBefore(b.timestamp) ? 1 : -1;
    });

    const from = params.page * params.size;
    const to = (params.page + 1) * params.size;
    const paginationData = sortedData.slice(from, Math.min(to, filteredData.length));

    const content = paginationData.map((operation, idx) => ({
      ...operation.toObject({ payload: true }),
      id: admin ? operation.id : from + idx,
      parentId: admin ? operation.parentId : `${from + idx}_sub`,
    }));

    return {
      content,
      totalElements: filteredData.length,
      totalPages: Math.ceil(filteredData.length / params.size),
      size: params.size,
      page: params.page,
    };
  };

  getOperationByActionHash = (actionType: ACTION_TYPE, hash: string) => {
    return this.operations.find(
      o => !!o.actions.find(a => a.type === actionType && a.transactionHash === hash)
    );
  };
}

// export const isStuckOperation = o => {
//   if (o.status === STATUS.IN_PROGRESS || o.status === STATUS.WAITING) {
//     let actionType: ACTION_TYPE;
//
//     switch (o.token) {
//       case TOKEN.ONE:
//         actionType =
//           o.type === OPERATION_TYPE.ETH_ONE
//             ? ACTION_TYPE.unlockHRC20Token
//             : ACTION_TYPE.mintHRC20Token;
//         break;
//
//       default:
//         actionType =
//           o.type === OPERATION_TYPE.ETH_ONE ? ACTION_TYPE.mintToken : ACTION_TYPE.unlockToken;
//         break;
//     }
//
//     const action = o.actions.find(a => a.type === actionType);
//
//     if (action && action.timestamp && (Date.now() - action.timestamp * 1000) / (1000 * 60) > 21) {
//       return true;
//     }
//   }
//
//   return false;
// };
