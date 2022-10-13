import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';

export class EthManager {
  contract: Contract;
  wsContract: Contract;
  account: Account;
  address: string;
  web3: Web3;
  constructor(contractJson, contractAddr: string, web3: Web3) {
    this.web3 = web3;
    this.contract = new web3.eth.Contract(contractJson.abi, contractAddr);
    this.address = contractAddr;
  }
}
