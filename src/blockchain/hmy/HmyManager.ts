import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils/types';
import { web3Hmy } from './index';
import { Account } from 'web3-core';

export class HmyManager {
  contract: Contract;
  account: Account;
  address: string;
  web3Hmy: Web3;
  // signer: any;
  abi: AbiItem[];

  constructor(contractJson, contractAddr) {
    this.contract = new web3Hmy.eth.Contract(contractJson.abi, contractAddr);
    this.abi = contractJson.abi;
    this.address = contractAddr;
    this.web3Hmy = web3Hmy;
  }
}
