export const legacyContracts = {
    multisigWallet: '0x715CdDa5e9Ad30A0cEd14940F9997EE611496De6',

    erc20Manager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
    hrc20Manager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',
    ethManager: '0xfD53b1B4AF84D59B20bF2C20CA89a6BeeAa2c628',

    tokenManager: '0xfE601dE9D4295274b9904D5a9Ad7069F23eE2B32',
    nativeTokenHRC20: '0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0',

    busd: '0xa011471158D19854aF08A22839f81321309D4A12',
    busdManager: '0xCC93449c89e8064124FFe1E9d3A84398b4f90ebd',
    link: '0xFEFB4061d5c4F096D29e6ac8e300314b5F00199c',
    linkManager: '0x9EDC8d0Bde1Fc666831Bda1ded5B34A45f9E886C',
    erc721Manager: '0x426A61A2127fDD1318Ec0EdCe02474f382FdAd30',

    hrc721Manager: '',
    hrc721TokenManager: '',

    hrc1155Manager: '',
    hrc1155TokenManager: '',

    erc1155Manager: '',
    erc1155TokenManager: '',
};

export const apiLegacy = {
    validators: [
      'https://be1.bridge.hmny.io',
      'https://be2.bridge.hmny.io',
      'https://be3.bridge.hmny.io',
    ],
    threshold: 2, // minimum validators number to do operation
    assetServiceUrl: 'https://be4.bridge.hmny.io', // assets statistic service
  };
  
  export const hmyClientLegacy = {
    nodeURL: 'https://api.s0.t.hmny.io',
    explorerURL: 'https://explorer.harmony.one/#',
    chainId: 1,
    contracts: {
      busd: '0xe176ebe47d621b984a73036b9da5d834411ef734',
      link: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
      busdManager: '0x05d11b7082d5634e0318d818a2f0cd381b371ea5',
      linkManager: '0xc0c7b147910ef11f6454dc1918ecde9a2b64a3a8',
      erc20Manager: '0x2fbbcef71544c461edfc311f42e3583d5f9675d1',
      erc20SubManager: '0xef81ab52721abbdae90862ee1ac10c20d3af2d0a',
      erc721Manager: '0x39ec213272dda1f46424726bb20d82c3861568c0',
      depositManager: '0xce3110e4ab757672b0535a9c1410fed80647b693',
    },
  };