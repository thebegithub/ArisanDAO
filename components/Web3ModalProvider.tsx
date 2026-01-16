import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'b1f66312480373c2105e468d6f469904'; // Example ID, user should replace this

// 2. Set chains (Lisk Sepolia)
const liskSepolia = {
    chainId: 4202,
    name: 'Lisk Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia-blockscout.lisk.com',
    rpcUrl: 'https://rpc.sepolia-api.lisk.com'
};

// 3. Create a metadata object
const metadata = {
    name: 'Lisk Arisan',
    description: 'Trustless Rotating Savings and Credit Association',
    url: 'http://localhost:3000', // Update in production
    icons: ['https://avatars.mywebsite.com/']
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: '...', // used for the Coinbase SDK
    defaultChainId: 1, // used for the Coinbase SDK
});

// 5. Create a Web3Modal instance
createWeb3Modal({
    ethersConfig,
    chains: [liskSepolia],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#6366f1', // Lisk Blue/Indigo
        '--w3m-border-radius-master': '1px'
    }
});

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
