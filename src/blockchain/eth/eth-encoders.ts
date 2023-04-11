import Web3 from 'web3';
const web3 = new Web3();

export const encodeUnlockTokenErc20 = (erc20Address, amount, recipient, receiptId) => {
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

export const encodeUnlockToken = (amount, recipient, receiptId) => {
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
      name: 'unlockToken',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [amount, recipient, receiptId]
  );
};

export const encodeUnlockEth = (amount, recipient, receiptId) => {
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
      name: 'unlockEth',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [amount, recipient, receiptId]
  );
};

export const encodeUnlockNative = (amount, recipient, receiptId) => {
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
      name: 'unlockNative',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [amount, recipient, receiptId]
  );
};

export const encodeUnlockTokenErc721 = (erc721Address, tokenId, recipient, receiptId) => {
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
      name: 'unlockToken',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    [erc721Address, tokenId, recipient, receiptId]
  );
};

export const encodeUnlockTokensErc721 = (erc721Address, tokenIds, recipient, receiptId) => {
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
    [erc721Address, tokenIds, recipient, receiptId]
  );
};

export const encodeMintTokenHrc20 = (hrc20Addr, amount, recipient, transactionHash) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'ethToken',
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
    [hrc20Addr, amount, recipient, transactionHash],
  );
};

export const encodeMintTokenHrc721 = (hrc721Addr, tokenIds, recipient, transactionHash) => {
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
    [hrc721Addr, tokenIds, recipient, transactionHash],
  );
};

export const encodeMintTokenHrc1155 = (hrc1155Addr, tokenIds, recipient, transactionHash, amounts, data) => {
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
    [hrc1155Addr, tokenIds, recipient, transactionHash, amounts, data],
  );
};

export const encodeUnlockTokensErc1155 = (erc1155Addr, tokenIds, recipient, transactionHash, amounts, data) => {
  return web3.eth.abi.encodeFunctionCall(
    {
      'constant': false,
      'inputs': [
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
    [erc1155Addr, tokenIds, recipient, transactionHash, amounts, data],
  );
};
