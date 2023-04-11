import { uuidv4 } from '../../services/utils';
import * as _ from 'lodash';

interface IError {
  error: string;
  status: boolean;
}

export const eventToObject = (event: IEventData) => {
  const evt = JSON.parse(JSON.stringify(event));

  if (evt.returnValues.__length__ !== undefined) {
    delete evt.returnValues.__length__;
  }

  return evt;
};

// oneToken: string;
// amount: string;
// recipient: string;
// receiptId: string;

export interface IEventData {
  returnValues: {
    [key: string]: any;
  };
  raw: {
    data: string;
    topics: string[];
  };
  event: string;
  signature: string;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  address: string;
  status?: boolean;
  transaction?: any;
  contract: string;
  name: string;
}

interface IEventsTracker {
  getEvent: (
    contract: string,
    eventName: string,
    condition: (event: IEventData) => boolean
  ) => IEventData;
}

export const isEventEqual = (event1: IEventData, event2: IEventData) => {
  return _.isEqual(event1, event2);
};

export class EventsConstructor {
  eventsTracker: IEventsTracker;
  managerAddress: string;
  managerMultiSigAddress: string;

  subscribers: Record<
    string,
    {
      event: string;
      success: (event: IEventData) => void;
      failed?: (event: IError) => void;
      condition: (event: IEventData) => boolean;
    }
  > = {};

  constructor(params: { eventsTracker: IEventsTracker; managerAddress; managerMultiSigAddress }) {
    this.eventsTracker = params.eventsTracker;
    this.managerAddress = params.managerAddress;
    this.managerMultiSigAddress = params.managerMultiSigAddress;
  }

  eventHandler = (event: IEventData) => {
    Object.keys(this.subscribers).forEach(id => {
      const sub = this.subscribers[id];

      console.log('New Event: ', event.event);

      if (sub.event === event.event && sub.condition(event)) {
        sub.success({ ...event, status: true });
        this.unsubscribe(id);
      }
    });
  };

  eventErrorHandler = (e: IEventData) => {
    console.log('-- eventErrorHandler --');
    // Object.keys(this.subscribers).forEach(id => {
    //   this.subscribers[id].failed({ error: e.message, status: false });
    //   this.unsubscribe(id);
    // });
  };

  public subscribe = (params: {
    event: string;
    success: (event: IEventData) => void;
    failed?: (event: IError) => void;
    condition: (event: IEventData) => boolean;
  }) => {
    const id = uuidv4();

    this.subscribers[id] = params;

    return id;
  };

  public unsubscribe = (id: string) => {
    delete this.subscribers[id];
  };

  isWSConnected = () => {
    return false;
  };
}
