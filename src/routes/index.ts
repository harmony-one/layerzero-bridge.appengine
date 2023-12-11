import { asyncHandler, checkAuth, createError } from './helpers';
import { IServices } from '../services/init';
import { getConfig } from '../configs';
import { validateEthBalanceNonZero, validateOneBalanceNonZeroEx } from '../services/operations/validations';
import { hmyEventsTracker } from '../blockchain/hmy';
import { MANAGER_ACTION, NETWORK_TYPE } from '../services/operations/interfaces';
import { networks } from '../blockchain/eth';
import { apiLegacy, hmyClientLegacy } from '../configs/mainnet';

export const routes = (app, services: IServices) => {
  // create new BUSD transfer operation
  app.post(
    '/operations',
    asyncHandler(async (req, res) => {
      const operation = await services.operations.create(req.body);

      return res.json(operation);
    })
  );

  // get BUSD operation info by ID
  app.get(
    '/operations/:id',
    asyncHandler(async (req, res) => {
      const data = await services.operations.getOperationById(req.params.id);

      if (!data) {
        throw createError(400, 'Operation not found');
      }

      return res.json(data);
    })
  );

  // action confirm
  app.post(
    '/operations/:operationId/actions/:actionType/confirm',
    asyncHandler(async (req, res) => {
      const data = await services.operations.setActionHash({
        operationId: req.params.operationId,
        actionType: req.params.actionType,
        transactionHash: req.body.transactionHash,
      });

      return res.json(data);
    })
  );

  // get all BUSD operations filtered by one|eth address
  app.get(
    '/operations',
    asyncHandler(async (req, res) => {
      const {
        ethAddress,
        oneAddress,
        stuck,
        status,
        network,
        type,
        token,
        transactionHash,
        amount,
      } = req.query;

      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      //       if (ethAddress && oneAddress) {
      //         const data = await services.operations.getAllOperationFullHistory({
      //           ethAddress,
      //           oneAddress,
      //           status,
      //           network,
      //           type,
      //           token,
      //           page,
      //           size,
      //           amount,
      //         });

      //         return res.json(data);
      //       }

      const data = await services.operations.getAllOperations({
        ethAddress,
        oneAddress,
        status,
        network,
        type,
        token,
        page,
        size,
        stuck,
        transactionHash,
        amount,
      });

      return res.json(data);
    })
  );

  app.get(
    '/operations-full',
    asyncHandler(async (req, res) => {
      const {
        ethAddress,
        oneAddress,
        stuck,
        status,
        network,
        type,
        token,
        transactionHash,
        amount,
      } = req.query;

      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      const data = await services.operations.getAllOperations({
        ethAddress,
        oneAddress,
        status,
        network,
        type,
        token,
        page,
        size,
        stuck,
        transactionHash,
        amount,
      });

      return res.json(data);

      // const data = await services.operations.getAllOperationFullHistory({
      //   ethAddress,
      //   oneAddress,
      //   status,
      //   network,
      //   type,
      //   token,
      //   page,
      //   size,
      //   amount,
      // });

      // return res.json(data);
    })
  );

  app.get(
    '/operations-erc20',
    asyncHandler(async (req, res) => {
      const data = await services.database.getDataByERC20(
        'operations',
        'timestamp',
        req.query.erc20
      );

      return res.json(data);
    })
  );

  app.get(
    '/operations-hrc20',
    asyncHandler(async (req, res) => {
      const data = await services.database.getDataByERC20(
        'operations',
        'timestamp',
        req.query.hrc20
      );

      return res.json(data);
    })
  );

  // get all BUSD operations filtered by one|eth address
  app.post(
    '/manage/operations',
    asyncHandler(async (req, res) => {
      await checkAuth(req.body.secret, services.database);

      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      const data = await services.operations.getAllOperations({ ...req.query, page, size }, true);

      return res.json(data);
    })
  );

  app.post(
    '/manage/operations/history',
    asyncHandler(async (req, res) => {
      await checkAuth(req.body.secret, services.database);

      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      const data = await services.operations.getAllOperationFullHistory({
        ...req.query,
        page,
        size,
      });

      return res.json(data);
    })
  );

  app.get(
    '/has-stuck',
    asyncHandler(async (req, res) => {
      return res.json(services.operations.hasStuck());
    })
  );

  app.get(
    '/token-price',
    asyncHandler(async (req, res) => {
      const data = await services.operations.getTokenUSDPrice(req.query.token, req.query.erc20);

      return res.json(data);
    })
  );

  //   app.get(
  //     '/deposit-amount/:network',
  //     asyncHandler(async (req, res) => {
  //       let data = await services.operations.getDepositAmount(req.params.network);

  //       if (parseInt(req.query.gas) > 0) {
  //         data += services.operations.getOneByETHGasFee(parseInt(req.query.gas));
  //       }

  //       return res.json(data);
  //     })
  //   );

  app.get(
    '/version',
    asyncHandler(async (req, res) => {
      return res.json({ version: '9.0.0' });
    })
  );

  app.get(
    '/config',
    asyncHandler(async (req, res) => {
      const config = getConfig();

      return res.json({
        ...config,
        api: apiLegacy,
        hmyClient: hmyClientLegacy,
        ethClient: config[NETWORK_TYPE.ETHEREUM],
        binanceClient: config[NETWORK_TYPE.BINANCE],
        arbitrumClient: config[NETWORK_TYPE.ARBITRUM],
      });
    })
  );

  //   app.get(
  //     '/balance/:network/:address',
  //     asyncHandler(async (req, res) => {
  //       let result;

  //       try {
  //         if(req.params.network === 'ONE') {
  //           result = await validateOneBalanceNonZeroEx(req.params.address);
  //         } else {
  //           result = await validateEthBalanceNonZero(req.params.address, req.params.network);
  //         }
  //       } catch (e) {
  //         throw createError(500, 'User eth balance is to low');
  //       }

  //       return res.json({ result });
  //     })
  //   );

  app.get(
    '/events-history-hmy',
    asyncHandler(async (req, res) => {
      const data = await hmyEventsTracker.getEventsHistory();

      return res.json(data);
    })
  );

  // app.get(
  //   '/test',
  //   asyncHandler(async (req, res) => {
  //     const data = await hmyMethodsBUSD.setONEToAddressTest();
  //
  //     return res.json(data);
  //   })
  // );

  app.get(
    '/events-history-bsc',
    asyncHandler(async (req, res) => {
      const data = await networks[NETWORK_TYPE.BINANCE].ethEventsTracker.getEventsHistory();
      return res.json(data);
    })
  );

  app.get(
    '/events-history-bsc-res',
    asyncHandler(async (req, res) => {
      const data = await networks[NETWORK_TYPE.BINANCE].ethEventsTrackerRes.getEventsHistory();
      return res.json(data);
    })
  );

  app.get(
    '/events-history-bsc-token',
    asyncHandler(async (req, res) => {
      const data = await networks[NETWORK_TYPE.BINANCE].ethTokensEventsTracker.getEventsHistory();
      return res.json(data);
    })
  );

  app.get(
    '/events-history-eth',
    asyncHandler(async (req, res) => {
      const data = await networks[NETWORK_TYPE.ETHEREUM].ethEventsTracker.getEventsHistory();
      return res.json(data);
    })
  );

  app.get(
    '/events-history-eth-res',
    asyncHandler(async (req, res) => {
      const data = await networks[NETWORK_TYPE.ETHEREUM].ethEventsTrackerRes.getEventsHistory();
      return res.json(data);
    })
  );

  let lastRequestTime = Date.now();
  let UI_CONFIG_CACHE;

  app.get(
    '/ui-config',
    asyncHandler(async (req, res) => {
      if (!UI_CONFIG_CACHE || Date.now() - lastRequestTime > 30 * 60 * 1000) {
        const assetsData = await services.database.getCollectionData('assets-config');
        const assetsBlackList = assetsData[0]['ui-black-list'];

        const blockers = await services.database.getCollectionData('blockers');

        UI_CONFIG_CACHE = { assetsBlackList, blockers };
        lastRequestTime = Date.now();
      }

      return res.json(UI_CONFIG_CACHE);
    })
  );

  app.post(
    '/manage/actions/:action',
    asyncHandler(async (req, res) => {
      const { action } = req.params;
      const { secret, ...otherParams } = req.body;

      await checkAuth(secret, services.database);

      let result;

      switch (action) {
        case MANAGER_ACTION.RESET:
          result = await services.operations.resetOperation(otherParams.operationId);
          break;

        case MANAGER_ACTION.SET_TRANSACTION:
          result = await services.operations.setActionHash(otherParams, true);
          break;

        case MANAGER_ACTION.RELOAD_EVENTS:
          switch (otherParams.network) {
            case NETWORK_TYPE.ETHEREUM:
              result = networks[NETWORK_TYPE.ETHEREUM].ethEventsTracker.reloadEvents(otherParams.value);
              break;

            case NETWORK_TYPE.BINANCE:
              result = networks[NETWORK_TYPE.BINANCE].ethEventsTracker.reloadEvents(otherParams.value);
              break;

            default:
              result = hmyEventsTracker.reloadEvents(otherParams.value);
              break;
          }
          break;
      }

      return res.json({ result, status: true });
    })
  );

  app.get(
    '/tokens',
    asyncHandler(async (req, res) => {
      const page = parseInt(req.query.page, 10) || 0;
      const size = parseInt(req.query.size, 10) || 50;

      const data = await services.tokens.getAllTokens({
        page,
        size,
      });

      return res.json(data);
    })
  );
};
