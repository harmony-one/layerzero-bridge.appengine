import axios from 'axios';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils/types';

interface IParams {
  fromBlock: string;
  toBlock: string;
  address: string;
  topics: string[];
}

export const getHmyLogs = async (params: IParams) => {
  const res: any = await axios.post(process.env.HMY_NODE_URL, {
    jsonrpc: '2.0',
    method: 'hmy_getLogs',
    params: [params],
    id: 74,
  });

  if (!res.data.result && res.data.error) {
    throw res.data.error.message;
  }

  return res.data;
};

export const getEvent = (web3: Web3, abi: AbiItem[], eventName: string) => {
  const abiItem: AbiItem = abi.find(a => a.type === 'event' && a.name === eventName);

  return { ...abiItem, signature: web3.eth.abi.encodeEventSignature(abiItem) };
};

export const getHmyTransactionReceipt = async (hash: string) => {
  const res: any = await axios.post(process.env.HMY_NODE_URL, {
    jsonrpc: '2.0',
    method: 'hmyv2_getTransactionReceipt',
    params: [hash],
    id: 1,
  });

  if (!res.data?.result && res.data.error) {
    throw res.data.error.message;
  }

  return res.data.result;
};

export const getHmyTransactionByHash = async (hash: string) => {
  const res: any = await axios.post(process.env.HMY_NODE_URL, {
    jsonrpc: '2.0',
    method: 'hmyv2_getTransactionByHash',
    params: [hash],
    id: 1,
  });

  if (!res.data?.result && res.data.error) {
    throw res.data.error.message;
  }

  return res.data.result;
};
