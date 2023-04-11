import Web3 from 'web3';
import { AbiItem } from 'web3-utils/types';
import { Contract } from 'web3-eth-contract';

import { eventToObject, IEventData, isEventEqual } from '../helpers/EventsConstructor';
import { uuidv4 } from '../../services/utils';
import { HmyManager } from './HmyManager';
import hmyMultiSigWalletJson = require('../contracts/MultiSigWallet.json');
import { safeRequest } from '../helpers/safeRequest';
import logger from '../../logger';
import { DBService } from '../../services/database';
import { sleep } from '../utils';
import { getEvent, getHmyLogs } from './helpers';
const log = logger.module('validator:HmyEventsTracker');

const CHECK_EVENTS_INTERVAL = 10000;

interface IEthEventTrackerParams {
  hmyManagerMultiSigAddress: string;
  database: DBService;
}

interface IGetEventsParams {
  abi: AbiItem[];
  address: string;
  event: string;
  fromBlock: number;
  toBlock: number;
}

type EventHandler = (event: IEventData) => void;

export class HmyEventsTracker {
  lastBlock = 0;
  startBlock = 0;
  lastNodeBlock = 0;

  hmyManagerMultiSigContract: Contract;
  hmyManagerMultiSigAddress: string;
  web3Hmy: Web3;
  web3: Web3;
  database: DBService;

  subscribers: Record<string, EventHandler> = {};
  tracks: Record<string, { eventName: string; manager: HmyManager; eventHandler: EventHandler }> =
    {};

  events: IEventData[] = [];
  needToReload = 0;

  constructor(params: IEthEventTrackerParams) {
    this.hmyManagerMultiSigAddress = params.hmyManagerMultiSigAddress;
    this.database = params.database;
    this.web3Hmy = new Web3(`${process.env.HMY_NODE_URL}`);
    this.web3 = new Web3(`${process.env.ETH_NODE_URL}/${process.env.INFURA_PROJECT_ID}`);

    // if (process.env.HMY_TOKENS_TRACKER_ENABLE !== 'true') {
    //   this.init();
    //   setTimeout(this.checkEvents, CHECK_EVENTS_INTERVAL);
    // }
    // setInterval(this.checkEvents, CHECK_EVENTS_INTERVAL);
  }

  getProgress = () =>
    ((this.lastBlock - this.startBlock) / (this.lastNodeBlock - this.startBlock)).toFixed(2);

  getInfo = () => {
    return {
      progress: this.getProgress(),
      total: this.events.length,
      lastBlock: this.lastBlock,
      lastNodeBlock: this.lastNodeBlock,
    };
  };

  init() {
    this.hmyManagerMultiSigContract = new this.web3Hmy.eth.Contract(
      hmyMultiSigWalletJson.abi as AbiItem[],
      this.hmyManagerMultiSigAddress
    );
  }

  onEventHandler = (callback: EventHandler) => {
    const id = uuidv4();

    this.subscribers[id] = callback;
  };

  addTrack = (eventName: string, manager: HmyManager, eventHandler: EventHandler) => {
    const id = uuidv4();

    this.tracks[id] = { manager, eventName, eventHandler };
  };

  getEventsHistory = () => this.events;

  getEvent = (
    contractAddress: string,
    eventName: string,
    condition: (data: IEventData) => boolean
  ) => {
    return this.events.find(
      event => event.contract === contractAddress && event.name === eventName && condition(event)
    );
  };

  updateEventExecuted = (
    contractAddress: string,
    eventName: string,
    transactionId: number,
    executed: boolean
  ) => {
    const event = this.events.find(
      event =>
        event.contract === contractAddress &&
        event.name === eventName &&
        event.returnValues.transactionId === transactionId
    );

    if (event) {
      event.transaction.executed = executed;
    }
  };

  addEvents = async (events: IEventData[]) => {
    const filteredEvents = events.filter(e1 => !this.events.find(e2 => isEventEqual(e1, e2)));

    this.events = this.events.concat(filteredEvents);

    if (this.events.length > 100000) {
      this.events = this.events.slice(1000);
    }

    return;

    let i = 0;

    while (filteredEvents[i]) {
      const event = filteredEvents[i];

      console.log(`hmy-${event.name}-${event.transactionHash}`);

      await this.database.updateDocument(
        'hmy-events',
        `${event.name}-${event.transactionHash}`,
        eventToObject(event)
      );

      i++;
    }
  };

  getEvents = async (params: IGetEventsParams): Promise<IEventData[]> => {
    const event = getEvent(this.web3Hmy, params.abi, params.event);
    const topicAddress = event.signature;

    const res = await safeRequest(
      async () => {
        return await getHmyLogs({
          fromBlock: '0x' + params.fromBlock.toString(16),
          toBlock: '0x' + params.toBlock.toString(16),
          address: params.address,
          topics: [topicAddress],
        });
      },
      `hmy_getLogs ${params.event}`,
      { result: [] }
    );

    const logs = res.result;

    return logs.map(item => {
      //try {
      const returnValues = this.web3.eth.abi.decodeLog(
        event.inputs,
        item.data,
        item.topics.slice(1)
      );
      // } catch (e) {
      //   log.error('1 Error decodeLog: ', { error: e, log, event: params.event });
      // }

      return {
        ...item,
        event: params.event,
        returnValues,
      };
    });
  };

  reloadEvents = (num: number) => (this.needToReload = num);

  private checkEvents = async () => {
    try {
      const timeStart = Date.now();

      const res = await this.web3Hmy.eth.getBlockNumber();
      const latest = Number(res);
      this.lastNodeBlock = latest;

      if (!this.lastBlock) {
        if (process.env.NETWORK == 'testnet') {
          this.lastBlock = latest - 1000;
        } else {
          this.lastBlock = latest - 60000;
          this.startBlock = this.lastBlock;
        }
      }

      let delta = latest - this.lastBlock;

      const DELTA_SIZE = process.env.NETWORK === 'mainnet' ? 1024 : 1024;

      if (delta > DELTA_SIZE) {
        delta = DELTA_SIZE;
      }

      if (latest > this.lastBlock) {
        const submissionEvents = await this.getEvents({
          address: this.hmyManagerMultiSigAddress,
          abi: hmyMultiSigWalletJson.abi as AbiItem[],
          event: 'Submission',
          fromBlock: this.lastBlock,
          toBlock: this.lastBlock + delta,
        });

        if (submissionEvents.length) {
          // log.warn(`New HMY Submission events: ${submissionEvents.length}`, {
          //   test: 'test',
          //   submissionEvents,
          // });
        }

        const newEvents = [];

        for (let i = 0; i < submissionEvents.length; i++) {
          const event = submissionEvents[i];

          const transaction = await safeRequest(async () => {
            return await this.hmyManagerMultiSigContract.methods
              .transactions(event.returnValues.transactionId)
              .call();
          }, 'hmyManagerMultiSig transaction');

          // Object.values(this.subscribers).forEach(eventHandler =>
          //   eventHandler({ ...event, transaction })
          // );

          newEvents.push({ ...event, transaction });
        }

        await this.addEvents(
          newEvents.map(e => ({
            ...e,
            contract: this.hmyManagerMultiSigAddress,
            name: 'Submission',
          }))
        );

        // console.log('Tracks: ', this.tracks);

        const tracks = Object.values(this.tracks);

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];

          const newEvents = await this.getEvents({
            abi: track.manager.abi,
            address: track.manager.address,
            event: track.eventName,
            fromBlock: this.lastBlock,
            toBlock: this.lastBlock + delta,
          });

          // if (newEvents.length) {
          //   log.warn(`New HMY events: ${newEvents.length}`, {
          //     event: track.eventName,
          //     manager: track.manager.address,
          //     newEvents,
          //   });
          // }

          // newEvents.forEach(track.eventHandler);

          await this.addEvents(
            newEvents.map(e => ({ ...e, contract: track.manager.address, name: track.eventName }))
          );
        }

        this.lastBlock = this.lastBlock + delta;
      } else {
        await sleep(CHECK_EVENTS_INTERVAL);
      }

      // log.info(`Time: ${Date.now() - timeStart}`, { test: 'test' });
    } catch (e) {
      log.error(`1 Error: checkEvents`, { error: e });
    }

    if (this.needToReload > 0) {
      try {
        const res = await this.web3Hmy.eth.getBlockNumber();
        const latest = Number(res);

        this.lastBlock = latest - this.needToReload;
        this.needToReload = 0;
      } catch (e) {}
    }

    setTimeout(this.checkEvents, 1000);
  };
}
