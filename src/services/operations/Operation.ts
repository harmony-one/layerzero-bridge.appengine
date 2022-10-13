import { ACTION_TYPE, NETWORK_TYPE, OPERATION_TYPE, STATUS, TOKEN, TOKEN_TYPE } from './interfaces';
import { Action } from './Action';
import { generateActionsPool } from './actions-pool';
import logger from '../../logger';
import { getDepositAmount, isAddressInBlackList } from './validations';
// import { needTopUpAccount } from './helpers';
import { OperationService } from './index';

const log = logger.module('validator:operation');

export interface IOperationInitParams {
  id: string;
  parentId?: string;
  status?: STATUS;
  type: OPERATION_TYPE;
  network: NETWORK_TYPE;
  erc20Address?: string;
  hrc20Address?: string;
  token: TOKEN;
  tokenType?: TOKEN_TYPE;
  ethAddress: string;
  oneAddress: string;
  actions?: Array<Action>;
  timestamp?: number;
  amount: string;
  wasRestarted?: number;
  operationService: OperationService;
}

export type TSyncOperationCallback = (operation: Operation) => Promise<void>;
export type TCreateOperationCallback = (
  operationId: string,
  erc20Address: string,
  amount: string
) => Promise<void>;

export class Operation {
  id: string;
  parentId: string;
  type: OPERATION_TYPE;
  token: TOKEN;
  tokenType: TOKEN_TYPE;
  network: NETWORK_TYPE;
  erc20Address?: string;
  hrc20Address?: string;
  status: STATUS;
  ethAddress: string;
  oneAddress: string;
  amount: string;
  timestamp: number;
  actions: Action[];
  rollbackActions: Action[];
  wasRestarted = 0;
  operationService: OperationService;

  syncOperationCallback: TSyncOperationCallback;
  createOperationCallback: TCreateOperationCallback;

  asyncConstructor = async (
    params: IOperationInitParams,
    callback: TSyncOperationCallback,
    createOperationCallback: TCreateOperationCallback
  ) => {
    this.id = params.id;
    this.parentId = params.parentId || '';
    this.oneAddress = params.oneAddress;
    this.ethAddress = params.ethAddress;
    this.amount = params.amount;
    this.type = params.type;
    this.tokenType = params.tokenType || TOKEN_TYPE.MAIN;
    this.network = params.network || NETWORK_TYPE.ETHEREUM;
    this.erc20Address = params.erc20Address;
    this.hrc20Address = params.hrc20Address;
    this.token = params.token;
    this.wasRestarted = params.wasRestarted;
    this.operationService = params.operationService;

    this.timestamp = !!params.status ? params.timestamp : Math.round(+new Date() / 1000);

    this.syncOperationCallback = callback;
    this.createOperationCallback = createOperationCallback;

    const { actions, rollbackActions } = await generateActionsPool(params, createOperationCallback);

    this.actions = actions;
    this.rollbackActions = rollbackActions;

    this.status = params.status;

    if (
      this.type === OPERATION_TYPE.ONE_ETH &&
      params.token != TOKEN.HRC721 &&
      params.token != TOKEN.HRC1155
    ) {
      let depositAmount = 0;

      if (!this.status) {
        depositAmount = await getDepositAmount(this.network);
      }

      // const depositAction = await generateDepositAction(params, depositAmount);

      // this.actions.unshift(depositAction);
    }

    if (!!this.status) {
      // check to rollbackAction
      const lastAction = params.actions[params.actions.length - 1];
      const prevLastAction = params.actions[params.actions.length - 2];

      if (
        [
          ACTION_TYPE.mintTokenRollback,
          ACTION_TYPE.unlockTokenRollback,
          ACTION_TYPE.mintHRC20TokenRollback,
          ACTION_TYPE.unlockHRC20TokenRollback,
        ].includes(prevLastAction.type)
      ) {
        this.actions = this.actions.concat(this.rollbackActions);
      }

      if (lastAction.type === ACTION_TYPE.withdrawOne) {
        // this.actions = this.actions.concat(generateWithdrawalAction(this, this.operationService));
      }

      if (
        [
          ACTION_TYPE.mintTokenRollback,
          ACTION_TYPE.unlockTokenRollback,
          ACTION_TYPE.mintHRC20TokenRollback,
          ACTION_TYPE.unlockHRC20TokenRollback,
        ].includes(lastAction.type)
      ) {
        this.actions = this.actions.concat(this.rollbackActions);
      }

      if (params.actions.find(a => a.type === ACTION_TYPE.topUpAccount)) {
        // await this.addTopUpAccountAction();
        // this.actions = this.actions.concat(generateTopUpAccountAction(this));
      }

      // init from DB
      this.actions.forEach(action => {
        const actionFromDB = params.actions.find(a => a.type === action.type);

        if (actionFromDB) {
          action.setParams(actionFromDB);
        }

        // if (
        //   actionFromDB.type === ACTION_TYPE.topUpAccount &&
        //   actionFromDB.status === STATUS.WAITING
        // ) {
        //   action.status = STATUS.SUCCESS;
        // }
      });
    } else {
      this.status = STATUS.WAITING;
    }

    if (this.status === STATUS.WAITING || this.status === STATUS.IN_PROGRESS) {
      this.startActionsPool();
    }
  };

  startActionsPool = async () => {
    let actionIndex = 0;

    // TODO: add mode for continue operation loading from DB
    if (this.actions.some(a => a.status === STATUS.IN_PROGRESS)) {
      return;
    }

    if (![STATUS.IN_PROGRESS, STATUS.WAITING].includes(this.status)) {
      return;
    }

    this.status = STATUS.IN_PROGRESS;

    // log.info('Operation start', { type: this.type.toString(), token: this.token });

    while (this.actions[actionIndex]) {
      const action = this.actions[actionIndex];

      if (
        this.type === OPERATION_TYPE.ONE_ETH &&
        [ACTION_TYPE.unlockToken, ACTION_TYPE.mintToken].includes(action.type) &&
        (isAddressInBlackList(this.oneAddress) || isAddressInBlackList(this.ethAddress))
      ) {
        this.status = STATUS.ERROR;
        break;
      }

      if (action.awaitConfirmation || action.status === STATUS.WAITING) {
        const res = await action.call();

        if (!res) {
          this.status = action.status === STATUS.CANCELED ? STATUS.CANCELED : STATUS.ERROR;
          await this.syncOperationCallback(this);

          const needWithdrawOne =
            this.type === OPERATION_TYPE.ONE_ETH &&
            ![ACTION_TYPE.depositOne, ACTION_TYPE.withdrawOne].includes(action.type);

          if (action.startRollbackOnFail) {
            // if (this.token === TOKEN.ERC20 && this.type === OPERATION_TYPE.ETH_ONE) {
            //   this.actions = this.actions.concat(
            //     this.rollbackActions,
            //     needWithdrawOne ? generateWithdrawalAction(this, this.operationService) : []
            //   );
            // }
          } else {
            if (needWithdrawOne) {
              // this.actions = this.actions
              //   .slice(0, actionIndex + 1)
              //   .concat(generateWithdrawalAction(this, this.operationService));
            } else {
              return;
            }
          }
        }

        await this.syncOperationCallback(this);
      }

      actionIndex++;

      // check to last action
      // if (
      //   !this.actions[actionIndex] &&
      //   this.type === OPERATION_TYPE.ETH_ONE &&
      //   !this.actions.find(a => a.type === ACTION_TYPE.topUpAccount) &&
      //   this.status === STATUS.IN_PROGRESS
      // ) {
      //   await this.addTopUpAccountAction();
      // }
    }

    if (this.status === STATUS.IN_PROGRESS) {
      this.status = STATUS.SUCCESS;
    }

    // log.info('Operation end', { type: this.type.toString(), token: this.token });

    await this.syncOperationCallback(this);
  };

  // addTopUpAccountAction = async () => {
  //   let needTopUpAccountUser = false;

  //   try {
  //     needTopUpAccountUser = await needTopUpAccount(this);
  //   } catch (e) {
  //     needTopUpAccountUser = false;
  //     log.error('error on needToTopUpWallet', { error: e });
  //   }

  //   if (needTopUpAccountUser) {
  //     this.actions.push(generateTopUpAccountAction(this));
  //   }
  // };

  toObject = (params?: { payload?: boolean }) => {
    return {
      id: this.id,
      parentId: this.parentId,
      type: this.type,
      erc20Address: this.erc20Address,
      hrc20Address: this.hrc20Address,
      token: this.token,
      tokenType: this.tokenType,
      network: this.network,
      status: this.status,
      amount: this.amount,
      ethAddress: this.ethAddress,
      oneAddress: this.oneAddress,
      wasRestarted: this.wasRestarted,
      timestamp: this.timestamp || this.actions[0].timestamp,
      actions: this.actions.map(a => a.toObject(params)),
    };
  };
}
