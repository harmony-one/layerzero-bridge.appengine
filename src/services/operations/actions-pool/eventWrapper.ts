import { EventsConstructor } from '../../../blockchain/helpers/EventsConstructor';
import logger from '../../../logger';
const log = logger.module('validator:eventWrapper');

const WAIT_TIMEOUT = 60 * 60 * 1000; // 60 min
const WAIT_TIMEOUT_SHORT = 5 * 60 * 1000; // 5 min

export const eventWrapper = (
  events: EventsConstructor,
  eventName: string,
  transactionHash: string,
  func: () => Promise<any>,
  condition?: (values: any, event: any) => boolean
): Promise<{
  status: boolean;
  transactionHash?: string;
}> => {
  return new Promise<{
    status: boolean;
    transactionHash?: string;
  }>(async (resolve, reject) => {
    try {
      let res;
      let timeout = WAIT_TIMEOUT;
      const interval = 1000;
      let intervalId;

      const conditionFunc = event => {
        if (condition) {
          return condition(event.returnValues, event);
        }

        return event.returnValues.receiptId === transactionHash;
      };

      const checkEvents = () => {
        timeout = timeout - interval;

        if (timeout < 0) {
          log.error(`${eventName}: action rejected by timeout`, {
            eventName,
            transactionHash,
            res,
          });
          clearTimeout(intervalId);
          reject({ status: false, error: 'Rejected by timeout' });
        }

        const evt = events.eventsTracker.getEvent(events.managerAddress, eventName, conditionFunc);

        if (evt) {
          clearTimeout(intervalId);
          resolve({ ...evt, status: true });
        }
      };

      intervalId = setInterval(checkEvents, interval);

      checkEvents();

      res = await func();

      if (!res || res.status !== true) {
        log.warn(`${eventName}: action rejected`, { eventName, transactionHash, res });
      }
    } catch (e) {
      log.error(`${eventName}: exception error`, { eventName, error: e, transactionHash });
      reject({ status: false, error: e.message });
    }
  });
};

export const waitWrapper = (
  func: () => Promise<{
    status: boolean;
    transactionHash?: string;
  }>,
  actionName?: string
): Promise<{
  status: boolean;
  transactionHash?: string;
}> => {
  return new Promise<{
    status: boolean;
    transactionHash?: string;
  }>(async (resolve, reject) => {
    try {
      let res;

      const timerId = setTimeout(() => {
        log.error(`${actionName}: action rejected by timeout`, { actionName, res });
        reject({ status: false, error: 'Rejected by timeout' });
      }, WAIT_TIMEOUT_SHORT);

      res = await func();

      if (!res || res.status !== true) {
        log.warn(`${actionName}: action rejected`, { actionName, res });
      }

      clearTimeout(timerId);

      return res;
    } catch (e) {
      log.error(`${actionName}: exception error`, { actionName, error: e });
      reject({ status: false, error: e.message });
    }
  });
};
