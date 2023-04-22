export interface ITokenInfo {
    name: string;
    horizon?: boolean;
    symbol: string;
    decimals: string;
    erc20Address: string;
    hrc20Address: string;
    totalLocked: string;
    totalSupply: string;
    totalLockedNormal: string;
    totalLockedUSD: string;
    token: TOKEN;
    type: TOKEN;
    network: NETWORK_TYPE;
    proxyERC20?: string;
    proxyHRC20?: string;
    image?: string;
    config?: {
        endpoint: string,
        chainId: number,
    },
    adapterParams?: string;
}

export enum NETWORK_TYPE {
    ETHEREUM = 'ETHEREUM',
    BINANCE = 'BINANCE',
    HARMONY = 'HARMONY',
    ARBITRUM = 'ARBITRUM'
}

export enum TOKEN {
    ERC20 = 'erc20',
    ETH = 'eth',
    ONE = 'one',
}

export const tokensConfigs: ITokenInfo[] = [
    {
        hrc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        erc20Address: '0x03fF0ff224f904be3118461335064bB48Df47938',
        proxyERC20: '0x2332137Ae0386783FFBCF40d9f17E50890917e15',
        proxyHRC20: '0x5B18a4E73F9A4fe337A072516b317863Ad3046aA',
        name: 'Harmony ONE',
        symbol: 'ONE',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ONE,
        type: TOKEN.ONE,
        network: NETWORK_TYPE.BINANCE,
        image: '/one.svg',
        adapterParams:
            '0x0001000000000000000000000000000000000000000000000000000000000007a120',
    },
    {
        hrc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        erc20Address: '0xd5cd84d6f044abe314ee7e414d37cae8773ef9d3',
        proxyERC20: '0x234784eC001Db36C9c22785CAd902221Fd831352',
        proxyHRC20: '0x905582f21fB9855c809d5b8933272a292dfbB138',
        name: 'Harmony ONE',
        symbol: 'ONE',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ONE,
        type: TOKEN.ONE,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/one.svg',
        adapterParams:
            '0x0001000000000000000000000000000000000000000000000000000000000007a120',
    },
    {
        hrc20Address: '0xDC60CcF6Ae05f898F4255EF580E731b4011100Ec',
        erc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        proxyERC20: '0x128AEdC7f41ffb82131215e1722D8366faaD0CD4',
        proxyHRC20: '0x7FFD57563EF54c464f23B5497dd1F54481E4c008',
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ETH,
        type: TOKEN.ETH,
        network: NETWORK_TYPE.BINANCE,
        image: '/binance.png',
        //  adapterParams: '0x0001000000000000000000000000000000000000000000000000000000000007a120'
    },
    {
        hrc20Address: '0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11',
        erc20Address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        proxyERC20: '0x1Edb8BdeD80E1b87eD19EE7D97Ee80B4fDb615c1',
        proxyHRC20: '0xA17426d430BCaDb09B0d42992C5BE186f485a4Da',
        name: 'Ethereum Coin',
        symbol: 'ETH',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ETH,
        type: TOKEN.ETH,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/eth.svg',
        //  adapterParams: '0x0001000000000000000000000000000000000000000000000000000000000007a120'
    },
    {
        hrc20Address: '0x118f50d23810c5E09Ebffb42d7D3328dbF75C2c2',
        erc20Address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        proxyERC20: '0xab6Ebe9472e2e4B6FE720Dad16701F32ab905CC6',
        proxyHRC20: '0x116C8344f79C334EB6cd0D55Ec603b6BA36f67A2',
        name: 'Wrapped BTC',
        symbol: 'WBTC',
        decimals: '8',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/wbtc_icon.svg',
    },
    {
        proxyERC20: '0xEe381e476b4335B8584A2026f3E845edaC2c69de',
        proxyHRC20: '0x6bEe6e5cf8E02833550B228D9CC6aD19Dae3743E',
        erc20Address: '0x514910771af9ca656af840dff83e8264ecf986ca',
        hrc20Address: '0x218532a12a389a4a92fc0c5fb22901d1c19198aa',
        //
        name: 'ChainLink Token',
        symbol: 'LINK',
        decimals: '18',
        image: '/link.png',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
    },
    {
        erc20Address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        hrc20Address: '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5',
        proxyERC20: '0x4f52b41a778761bd2eea5b7b7ed8cbdaa02cef3e',
        proxyHRC20: '0xB2238ca2E9704128ee24490ee774820735b57Caa',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: '6',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/usdc.svg',
    },
    {
        hrc20Address: '0xF2732e8048f1a411C63e2df51d08f4f52E598005',
        erc20Address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        proxyERC20: '0xF6a097b278383eF0A800ABD7d700b29B159B19b5',
        proxyHRC20: '0xACF6d3052bbE774187e3364A0E76d0f586131766',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: '6',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/usdt.svg',
    },
    {
        hrc20Address: '0xd068722E4e1387E4958300D1e625d2878f784125',
        erc20Address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        proxyERC20: '0x85db5268403700e901285E8B8Fb0CADf4212B95E',
        proxyHRC20: '0xb1fDEEC683bEbA148aA9fEdcf9EEb6d44215A62e',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/dai.svg',
    },
    {
        hrc20Address: '0xFeee03BFBAA49dc8d11DDAab8592546018dfb709',
        erc20Address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
        proxyERC20: '0xAd7514b8B1EADFad8B1Ff0873Dba52E304C87446',
        proxyHRC20: '0xADc724A6d7a77d28ED2F707317444A5e10df3a7a',
        name: 'Binance USD',
        symbol: 'BUSD',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/busd.svg',
    },
    {
        hrc20Address: '0x1Aa1F7815103c0700b98f24138581b88d4cf9769',
        erc20Address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        proxyERC20: '0x98e871aB1cC7e3073B6Cc1B661bE7cA678A33f7F',
        proxyHRC20: '0xD39574a84aBe014f41E5e4Eb77D74A370ed9AD07',
        name: 'Binance BUSD',
        symbol: 'BUSD',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/busd.svg',
    },
    {
        hrc20Address: '0xAE0609A062a4eAED49dE28C5f6A193261E0150eA',
        erc20Address: '0x5ba19d656b65f1684cfea4af428c23b9f3628f97',
        proxyERC20: '0x128AEdC7f41ffb82131215e1722D8366faaD0CD4',
        proxyHRC20: '0x83e54C21fe3E5b2E19C76B5f4DFbc389844faF1D',
        name: 'AAG',
        symbol: 'AAG',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/aag_icon.svg',
    },
    {
        hrc20Address: '0xd9E290C1Cb1cAF57ca12A4F03fC3eE5689bF2D83',
        erc20Address: '0x853d955acef822db058eb8505911ed77f175b99e',
        proxyERC20: '0x0486d2c4E7Be28c8B45459DcB23De077c03b299d',
        proxyHRC20: '0x78Bdf1655108156729409a40B904209E716F35FA',
        name: 'Frax',
        symbol: 'FRAX',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/frax_icon.svg',
    },
    {
        hrc20Address: '0xbea6830380Dfb0283A699B0E085309215A24d9cc',
        erc20Address: '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
        proxyERC20: '0x3e843802863904CB57C8f0f810e430A49C841d02',
        proxyHRC20: '0x8b2ef8236f4418D0e9c3cB650780a14168C6C28e',
        name: 'Frax Share',
        symbol: 'FXS',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/frax_share_fxs_icon.svg',
    },
    {
        hrc20Address: '0x41b7199da8276DbdEd449D717BAFFaB8C43A6a10',
        erc20Address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
        proxyERC20: '0x7b0c1DDBef7ce61911208f84cfc0BcD1184236d0',
        proxyHRC20: '0x97BdaAefBFACb6ad152279d95e59A2789fe1bE8C',
        name: 'SushiToken',
        symbol: 'SUSHI',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/sushi_icon.svg',
    },
    {
        hrc20Address: '0x4caC2771ab80107a5035bFEc0aB7E745ed598D8D',
        erc20Address: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
        proxyERC20: '0x85bA92E2adE9EF7857850C7c0E6f7AC441fA6E57',
        proxyHRC20: '0xDE06e6976e54f459a42C3b056E591c1bD8f12090',
        name: 'SushiBar',
        symbol: 'xSUSHI',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/xsushi_icon.svg',
    },
    {
        hrc20Address: '0x8fD86715C0939138ff8D268B3fbF23043856a52e',
        erc20Address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        proxyERC20: '0xAB29422593a2044DAA02150C9Bb145d587cf4FDB',
        proxyHRC20: '0xa9038ca84e96C9e47dc96dd31A66D8F4a2BFEAf3',
        name: 'Aave Token',
        symbol: 'AAVE',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/aave_icon.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x1d374ED0700a0aD3cd4945D66a5B1e08e5db20A8',
        erc20Address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
        proxyERC20: '0xfB5a2461D49D83348C557A5Ad7AA938DCF444d7f',
        proxyHRC20: '0x9c34f9699D536F306435ce2AAe0065c92f75f603',
        name: 'Dai Token',
        symbol: 'DAI',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/dai.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x44cED87b9F1492Bf2DCf5c16004832569f7f6cBa',
        erc20Address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        proxyERC20: '0x8d1ebcda83fd905b597bf6d3294766b64ecf2aa7',
        proxyHRC20: '0xcE59e51645De8F8FF24229F89e105CadEb96EA57',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/usdc.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x9A89d0e1b051640C6704Dde4dF881f73ADFEf39a',
        erc20Address: '0x55d398326f99059ff775485246999027b3197955',
        proxyERC20: '0x0551Ca9E33bada0355Dfce34685Ad3B73CF3Ad70',
        proxyHRC20: '0x8bab2dde26ce3f948b9b3e146760b66b60810fc7',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/usdt.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x3e9D32580B0BF3aE72AFCBEbC68710d2Fd9a18F0',
        erc20Address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        proxyERC20: '0x9876993E7E1750cc375a569731ca0583D0849F65',
        proxyHRC20: '0xbF44Dc386670629590C2B3c30096E8f0471CA869',
        name: 'PancakeSwap Token',
        symbol: 'Cake',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/pancakeswap_cake_logo.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x783EE3E955832a3D52CA4050c4C251731c156020',
        erc20Address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        proxyERC20: '0x664491FD329a1b98d83Cf585CC2e54af5Ab11CBD',
        proxyHRC20: '0xcc7fB91Ec8Db666433D29b9C65adA1A09576fEba',
        name: 'Ethereum Token',
        symbol: 'ETH',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/eth.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x582617bD8Ca80d22D4432E63Fda52D74dcDCEe4c',
        erc20Address: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
        proxyERC20: '0x1Edb8BdeD80E1b87eD19EE7D97Ee80B4fDb615c1',
        proxyHRC20: '0xF4d83E35874BEe7cb363D37D45CA2AdF8C6c26D7',
        name: 'Cardano Token',
        symbol: 'ADA',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/cardano_ada_logo.svg',
    },
    {
        horizon: true,
        hrc20Address: '0xf038B9e5c54ffeEbD8a6F0CF15cFe0e9DdD0AFd8',
        erc20Address: '0xB2AA453B56b495cb95BC9fa72E7706B84e41EE54',
        proxyERC20: '0x23E058c2f736D0C98ECBf800a164dd68ed28D983',
        proxyHRC20: '0x16023D2619d82507Da834C65be9A42E98E847c4b',
        name: 'WND',
        symbol: 'WND',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/wonderhero_wnd_logo.svg',
    },
    {
        horizon: true,
        hrc20Address: '0xC079d0385492Ac2D0e89ca079c186Dd71ef49B1e',
        erc20Address: '0x60d66a5152612F7D550796910d022Cb2c77B09de',
        proxyERC20: '0xbDD7B6370Ca647299aF8b02E49eF59e5113088CE',
        proxyHRC20: '0x1A2567000Db62B0BB4A652C59bdA6897fe7E7e76',
        name: 'Useless',
        symbol: 'USE',
        //
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/useless.png',
        adapterParams:
            '0x0001000000000000000000000000000000000000000000000000000000000007a120',
    },
    {
        horizon: true,
        hrc20Address: '0x14A7B318fED66FfDcc80C1517C172c13852865De',
        erc20Address: '0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b',
        proxyERC20: '0x06B448Fb849927FCeC43Fac01A23d16aFF6C8AE6',
        proxyHRC20: '0xe4095e1996CA8B7f695412706d4Ed9A27417EA61',
        name: 'AXS',
        symbol: 'Axie Infinity Shard',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/axs.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x7aFB0E2ebA6Dc938945FE0f42484d3b8F442D0AC',
        erc20Address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
        proxyERC20: '0xECd19aAdf33213a298875DA0CC15d80F155B7391',
        proxyHRC20: '0xD4464dCbd31BA4391C01a2a10aA37E049e55dB21',
        name: 'PAXG',
        symbol: 'Paxos Gold',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/paxg.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x63cf309500d8be0B9fDB8F1fb66C821236c0438c',
        erc20Address: '0x25f8087EAD173b73D6e8B84329989A8eEA16CF73',
        proxyERC20: '0x81220d913b8cf1D725f35Baf888b3ce65fb693ef',
        proxyHRC20: '0x679476083E4380a3bFC95fc956Af3b467468Ca33',
        name: 'Yield Guild Games Token',
        symbol: 'YGG',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/ygg.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x39aB439897380eD10558666C4377fACB0322Ad48',
        erc20Address: '0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
        proxyERC20: '0x16E86206d3Fb0BfD96803f8cF78354bA6d46515d',
        proxyHRC20: '0x1B0afbF1a7Ef7DB80f79e540Dce52Fc259b4B65f',
        name: 'Fantom Token',
        symbol: 'FTM',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/ftm.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x58f1b044d8308812881a1433d9Bbeff99975e70C',
        erc20Address: '0x111111111117dC0aa78b770fA6A738034120C302',
        proxyERC20: '0x7DE593d01D2E9EaC1611ed822f823097b12CC5C3',
        proxyHRC20: '0xAE41D93368777fbA352c8f2Ed569aFEf07A27E41',
        name: '1INCH Token',
        symbol: '1INCH',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/1inch.svg',
    },
    {
        horizon: true,
        hrc20Address: '0xDc5f76104D0B8D2bF2c2Bbe06CDFE17004E9010f',
        erc20Address: '0xba100000625a3754423978a60c9317c58a424e3D',
        proxyERC20: '0x069481DB4f4d03D83d63C743836359ba868fA600',
        proxyHRC20: '0x9E3eD2f246fd00cb5D94695C3dbE9f167aEE1Fe0',
        name: 'Balancer',
        symbol: 'BAL',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ETHEREUM,
        image: '/bal.svg',
    },
    // BSC
    {
        horizon: true,
        hrc20Address: '0xF155E1a57DB0Ca820aE37Ab4050e0e4C7cFcEcd0',
        erc20Address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
        proxyERC20: '0xF634c6d62E480837321d753b9189CCeAE2170789',
        proxyHRC20: '0x04146De37b996D89A635c1BA724d6F4da7cC85AA',
        name: 'Dogecoin',
        symbol: 'DOGE',
        decimals: '8',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/doge.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x6E7bE5B9B4C9953434CD83950D61408f1cCc3bee',
        erc20Address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
        proxyERC20: '0x8b97B6ac20721C1536465d4D77A867749B3831F4',
        proxyHRC20: '0x378DbaC9944FF07a7A197C7b90f522F34490706A',
        name: 'Matic Token',
        symbol: 'MATIC',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/matic.svg',
    },
    {
        horizon: true,
        hrc20Address: '0xd6bAd903e550822d51073AFb79581BF5aAE9243F',
        erc20Address: '0x0Eb3a705fc54725037CC9e008bDede697f62F335',
        proxyERC20: '0xA2BA7aa169E5C77eB37A5330F2695fEe8D1216ac',
        proxyHRC20: '0xaE77BBf27DB792178550f114Ba4409f448FAA897',
        name: 'Cosmos Token',
        symbol: 'ATOM',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/atom.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x08CB2917245BBE75C8C9c6Dc4a7B3765Dae02b31',
        erc20Address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
        proxyERC20: '0x8da02bEDF802976a69627Dd8ae081493d8FDf0F0',
        proxyHRC20: '0x6eB05EF293bD937479ad018295fb3037F9C2404C',
        name: 'Polkadot Token',
        symbol: 'DOT',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/dot.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x0341D02C0fD5439576742750e6F2a2C0993A520b',
        erc20Address: '0xb86AbCb37C3A4B64f74f59301AFF131a1BEcC787',
        proxyERC20: '0xC7A2261237EA89dF231d8f71108822a03Eedbc51',
        proxyHRC20: '0x243169cF4a787b18F3F43142202f5c902FF40881',
        name: 'Zilliqa',
        symbol: 'ZIL',
        decimals: '12',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/zil.svg',
    },
    {
        horizon: true,
        hrc20Address: '0x04f308C988ec1C5A4e4A99d3d2A5B8F4287260bD',
        erc20Address: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63',
        proxyERC20: '0x00795A3Fd0d895A3507D43316Da07376C7cb36d0',
        proxyHRC20: '0xbFAba9B2A66a542e7550baD7dF1DFA9F91a76B1B',
        name: 'Venus',
        symbol: 'XVS',
        decimals: '18',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.BINANCE,
        image: '/xvs.svg',
    },
    {
        hrc20Address: '0xb1856a6f43fbe216b169803e0d5e2b38fbb5f982',
        erc20Address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        proxyERC20: '0x3E266b1531575b9426b832BADF478358B2232cA4',
        proxyHRC20: '0x2beb8a66ce136c3920522b23d6daee975a5cef87',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: '6',
        totalLocked: '0',
        totalSupply: '0',
        totalLockedNormal: '0',
        totalLockedUSD: '0',
        token: TOKEN.ERC20,
        type: TOKEN.ERC20,
        network: NETWORK_TYPE.ARBITRUM,
        image: '/xvs.png',
      },
];
