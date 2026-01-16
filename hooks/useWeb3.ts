import { useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { ARISAN_ABI, CONTRACT_ADDRESS } from '../constants/abi';

declare global {
    interface Window {
        ethereum: any;
    }
}

export interface Web3State {
    provider: BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    contract: Contract | null;
    address: string | null;
    isManager: boolean;
    chainId: bigint | null;
    isConnected: boolean;
}

export const useWeb3 = () => {
    const [state, setState] = useState<Web3State>({
        provider: null,
        signer: null,
        contract: null,
        address: null,
        isManager: false,
        chainId: null,
        isConnected: false,
    });

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask (atau wallet web3 lain) tidak terdeteksi!");
            return;
        }

        try {
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            // Inisialisasi Contract
            // Pastikan CONTRACT_ADDRESS diisi dengan benar di constants/abi.ts
            let contract = null;
            let isManager = false;

            if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.startsWith("0x")) {
                contract = new Contract(CONTRACT_ADDRESS, ARISAN_ABI, signer);

                // Cek apakah user adalah Manager (Owner)
                try {
                    const ownerAddress = await contract.owner();
                    if (ownerAddress.toLowerCase() === address.toLowerCase()) {
                        isManager = true;
                    }
                } catch (err) {
                    console.error("Gagal mengecek owner:", err);
                }
            }

            setState({
                provider,
                signer,
                contract,
                address,
                isManager,
                chainId: network.chainId,
                isConnected: true,
            });

        } catch (error) {
            console.error("Gagal connect wallet:", error);
            alert("Gagal menghubungkan wallet.");
        }
    };

    // Auto-detect jika akun berubah di MetaMask
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            });
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    return {
        ...state,
        connectWallet
    };
};
