import Web3 from 'web3';
const web3 = new Web3();

export const encodeMintTokenErc20 = (hrc20Addr, amount, recipient, transactionHash) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'oneToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'mintToken',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [hrc20Addr, amount, recipient, transactionHash]
  );
};

export const encodeMintToken = (amount, recipient, receiptId) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'mintToken',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [amount, recipient, receiptId]
  );
};

export const encodeMintTokenErc721 = (hrc20Addr, tokenId, recipient, transactionHash) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'oneToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'mintToken',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [hrc20Addr, tokenId, recipient, transactionHash]
  );
};

export const encodeMintTokensErc721 = (hrc20Addr, tokenIds, recipient, transactionHash) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'oneToken',
          type: 'address',
        },
        {
          internalType: 'uint256[]',
          name: 'tokenIds',
          type: 'uint256[]',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'mintTokens',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [hrc20Addr, tokenIds, recipient, transactionHash]
  );
};

export const encodeUnlockTokenHrc20 = (erc20Address, amount, recipient, receiptId) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'ethTokenAddr',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'unlockToken',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [erc20Address, amount, recipient, receiptId]
  );
};

export const encodeUnlockOne = (amount, recipient, receiptId) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          internalType: 'address payable',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'unlockOne',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [amount, recipient, receiptId],
  );
};

export const encodeUnlockTokensHrc721 = (hrc721Address, tokenIds, recipient, receiptId) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'ethTokenAddr',
          type: 'address',
        },
        {
          internalType: 'uint256[]',
          name: 'tokenIds',
          type: 'uint256[]',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
      ],
      name: 'unlockTokens',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [hrc721Address, tokenIds, recipient, receiptId],
  );
};

export const encodeUnlockTokensHrc1155 = (hrc1155Address, tokenIds, recipient, receiptId, amounts, data) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'ethTokenAddr',
          type: 'address',
        },
        {
          internalType: 'uint256[]',
          name: 'tokenIds',
          type: 'uint256[]',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
        {
          internalType: 'uint256[]',
          name: 'amounts',
          type: 'uint256[]',
        },
        {
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
      ],
      name: 'unlockHRC1155Tokens',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [hrc1155Address, tokenIds, recipient, receiptId, amounts, data],
  );
};

export const encodeMintTokensErc1155 = (erc1155Address, tokenIds, recipient, receiptId, amounts, data) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      'constant': false,
      'inputs': [
        {
          internalType: 'address',
          name: 'oneToken',
          type: 'address',
        },
        {
          internalType: 'uint256[]',
          name: 'tokenIds',
          type: 'uint256[]',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'bytes32',
          name: 'receiptId',
          type: 'bytes32',
        },
        {
          internalType: 'uint256[]',
          name: 'amounts',
          type: 'uint256[]',
        },
        {
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
      ],
      name: 'mintTokens',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [erc1155Address, tokenIds, recipient, receiptId, amounts, data],
  );
};
