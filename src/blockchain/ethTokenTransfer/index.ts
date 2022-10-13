// import Web3 from 'web3';
// import BN, { EthMethods } from './EthMethods';
// import { EthManager } from './EthManager';
//
// import erc20Json = require('../contracts/IERC20.json');
//
// export * from './EthMethods';
//
// export const web3URL = process.env.ETH_NODE_URL;
// export const web3 = new Web3(web3URL);
//
// export const transferToken = async (accountAddr: string, amount: number) => {
//   if (!web3.utils.isAddress(accountAddr)) {
//     throw new Error('Invalid account address');
//   }
//
//   // let res = await this.ethToken.contract.methods.increaseSupply(amount).send({
//   //   from: this.ethToken.account.address,
//   //   gas: process.env.ETH_GAS_LIMIT,
//   //   gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
//   // });
//   //
//   // if (res.status !== true) {
//   //   return res;
//   // }
//
//   const res = await this.ethToken.contract.methods.transfer(accountAddr, amount).send({
//     from: this.ethToken.account.address,
//     gas: process.env.ETH_GAS_LIMIT,
//     gasPrice: new BN(await this.web3.eth.getGasPrice()).mul(new BN(1)),
//   });
//
//   return res;
// };
