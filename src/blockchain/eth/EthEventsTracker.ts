import { EthManager } from '../eth/EthManager';
import Web3 from 'web3';
import { uuidv4 } from '../../services/utils';
import { eventToObject, IEventData, isEventEqual } from '../helpers/EventsConstructor';
import { Contract } from 'web3-eth-contract';
import logger from '../../logger';
import { sleep } from '../utils';
import { NETWORK_TYPE } from '../../services/operations/interfaces';
import { DBService } from '../../services/database';

const log = logger.module('validator:EthEventsTracker');

const CHECK_INTERVAL = Number(process.env.ETH_CHECK_EVENTS_INTERVAL);

interface IEthEventTrackerParams {
  ethManager: EthManager;
  web3: Web3;
  eventName: string;
  network: NETWORK_TYPE;
  database: DBService;
  height?: number;
  maxDelta?: number;
  interval?: number;
  relativeHeight?: number;
  reserveEventsTracker?: EthEventsTracker;
}

type EventHandler = (event: IEventData) => void;

export class EthEventsTracker {
  lastBlock;
  ethMultiSigManager: EthManager;
  web3: Web3;
  eventName: string;
  network: NETWORK_TYPE;
  maxDelta: number;
  interval: number;
  database: DBService;
  needToReload = 0;
  height = 0;
  relativeHeight = 0;

  reserveEventsTracker: EthEventsTracker;

  subscribers: Record<string, EventHandler> = {};
  tracks: Record<
    string,
    {
      eventName: string;
      contract: Contract;
      contractAddress: string;
      eventHandler: EventHandler;
      hasSubscribers: () => boolean;
    }
  > = {};

  events: IEventData[] = [];

  constructor(params: IEthEventTrackerParams) {
    this.web3 = params.web3;
    this.ethMultiSigManager = params.ethManager;
    this.eventName = params.eventName;
    this.network = params.network;
    this.database = params.database;
    this.height = params.height;

    if (params.maxDelta && params.interval) {
      this.maxDelta = params.maxDelta;
      this.interval = params.interval;
    } else {
      if (params.network === NETWORK_TYPE.BINANCE) {
        this.maxDelta = 400;
        this.interval = 3000;
      } else {
        this.maxDelta = 1000;
        this.interval = CHECK_INTERVAL;
      }
    }

    this.relativeHeight = params.relativeHeight || 10000;

    this.reserveEventsTracker = params.reserveEventsTracker;

    // if (process.env.HMY_TOKENS_TRACKER_ENABLE !== 'true' || params.eventName === 'TokenMapAck') {
    //   setTimeout(this.init, 10000);
    // }
  }

  public onEventHandler = (callback: EventHandler) => {
    const id = uuidv4();

    this.subscribers[id] = callback;

    if (!!this.reserveEventsTracker) {
      this.reserveEventsTracker.onEventHandler(callback);
    }
  };

  public addTrack = (
    eventName: string,
    contract: Contract,
    contractAddress: string,
    eventHandler: EventHandler,
    hasSubscribers: () => boolean
  ) => {
    const id = uuidv4();

    this.tracks[id] = { contract, eventName, eventHandler, hasSubscribers, contractAddress };

    if (!!this.reserveEventsTracker) {
      this.reserveEventsTracker.addTrack(
        eventName,
        contract,
        contractAddress,
        eventHandler,
        hasSubscribers
      );
    }
  };

  public getEvent = (
    contractAddress: string,
    eventName: string,
    condition: (data: IEventData) => boolean
  ) => {
    const event = this.events.find(
      event => event.contract === contractAddress && event.name === eventName && condition(event)
    );

    if (event) {
      return event;
    } else if (!!this.reserveEventsTracker) {
      return this.reserveEventsTracker.getEvent(contractAddress, eventName, condition);
    }
  };

  public getEventsHistory = () => this.events;
  public reloadEvents = (num: number) => (this.needToReload = num);

  addEvents = async (events: IEventData[]) => {
    const filteredEvents = events.filter(e1 => !this.events.find(e2 => isEventEqual(e1, e2)));

    this.events = this.events.concat(filteredEvents);

    if (this.events.length > 10000) {
      this.events = this.events.slice(1000);
    }

    return;

    let i = 0;

    while (filteredEvents[i]) {
      const event = filteredEvents[i];

      console.log(`${this.network}-${event.name}-${event.transactionHash}`);

      await this.database.updateDocument(
        `${this.network}-events`,
        `${event.name}-${event.transactionHash}`,
        eventToObject(event)
      );

      i++;
    }
  };

  private init = async () => {
    const latest = await this.web3.eth.getBlockNumber();

    this.lastBlock = this.height ? this.height : latest - this.relativeHeight;

    return this.checkEvents();
  };

  private checkEvents = async () => {
    try {
      const latest = await this.web3.eth.getBlockNumber();

      if (latest > this.lastBlock) {
        let delta = latest - this.lastBlock;

        if (delta > this.maxDelta) {
          delta = this.maxDelta;
        }

        const submissionEvents = await this.ethMultiSigManager.contract.getPastEvents(
          this.eventName,
          {
            filter: {},
            fromBlock: this.lastBlock,
            toBlock: this.lastBlock + delta,
          }
        );

        if (submissionEvents.length) {
          console.log(`Ethereum New ${this.eventName} events: `, submissionEvents.length);
        }

        for (let i = 0; i < submissionEvents.length; i++) {
          const event = submissionEvents[i];
          let transaction;

          if (this.eventName === 'Submission') {
            transaction = await this.ethMultiSigManager.contract.methods
              .transactions(event.returnValues.transactionId)
              .call();
          }

          const eventEx = {
            ...event,
            transaction,
            name: this.eventName,
            contract: this.ethMultiSigManager.address,
          };

          Object.values(this.subscribers).forEach(eventHandler => eventHandler(eventEx));

          await this.addEvents([eventEx]);

          await sleep(1000);
        }

        if (this.eventName === 'Submission') {
          const executionEvents = await this.ethMultiSigManager.contract.getPastEvents(
            'Execution',
            {
              filter: {},
              fromBlock: this.lastBlock,
              toBlock: this.lastBlock + delta,
            }
          );

          await this.addEvents(
            executionEvents.map(event => ({
              ...event,
              name: 'Execution',
              contract: this.ethMultiSigManager.address,
            }))
          );
        }

        const tracks = Object.values(this.tracks);

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];

          const newEvents = await track.contract.getPastEvents(track.eventName, {
            filter: {},
            fromBlock: this.lastBlock,
            toBlock: this.lastBlock + delta,
          });

          if (newEvents.length) {
            console.log('New unlocked events: ', newEvents.length);
          }

          newEvents.forEach(track.eventHandler);

          await this.addEvents(
            newEvents.map(event => ({
              ...event,
              name: track.eventName,
              contract: track.contractAddress,
            }))
          );
        }

        this.lastBlock = this.lastBlock + delta - 1;
      } else {
        // console.log(`${this.network} last block !!!`)
        await sleep(10000);
      }
    } catch (e) {
      log.error('checkEvents', { error: e });
      await sleep(20000);
    }

    if (this.needToReload > 0) {
      try {
        const latest = await this.web3.eth.getBlockNumber();
        this.lastBlock = latest - this.needToReload;
        this.needToReload = 0;
      } catch (e) {}
    }

    setTimeout(this.checkEvents, this.interval);
  };
}
