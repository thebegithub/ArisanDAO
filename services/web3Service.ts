import { ethers } from 'ethers';
import { WalletState } from '../types';
import { FACTORY_ADDRESS, FACTORY_ABI, ARISAN_ABI, USDT_ADDRESS, ERC20_ABI } from '../contracts/abis';
import toast from 'react-hot-toast';

declare global {
    interface Window {
        ethereum?: any;
    }
}

const LISK_SEPOLIA_CHAIN_ID = '0x106a'; // 4202
const LISK_SEPOLIA_CONFIG = {
    chainId: LISK_SEPOLIA_CHAIN_ID,
    chainName: 'Lisk Sepolia Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
    blockExplorerUrls: ['https://sepolia-blockscout.lisk.com'],
};

// Helper to find MetaMask provider and AVOID OKX/Others that mimic it
const getEthereumProvider = () => {
    if (!window.ethereum) return null;

    // Strategy 1: EIP-5749 (window.ethereum.providers)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        const realMetaMask = window.ethereum.providers.find((p: any) =>
            p.isMetaMask && !p.isOkxWallet && !p.isOKExWallet && !p.isPhantom
        );
        if (realMetaMask) return realMetaMask;
    }

    // Strategy 2: Check global window.ethereum
    if (window.ethereum.isOkxWallet || window.ethereum.isOKExWallet) {
        console.warn("OKX Wallet detected overriding window.ethereum. Attempting to find alternatives...");
    }

    return window.ethereum;
};

export const Web3Service = {
    connectWallet: async (): Promise<WalletState> => {
        const ethProvider = getEthereumProvider();
        if (!ethProvider) {
            toast.error("MetaMask is not installed!");
            return { isConnected: false, address: null, balance: '0' };
        }

        try {
            const provider = new ethers.BrowserProvider(ethProvider);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();

            if (network.chainId !== BigInt(4202)) {
                try {
                    await ethProvider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: LISK_SEPOLIA_CHAIN_ID }],
                    });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        try {
                            await ethProvider.request({
                                method: 'wallet_addEthereumChain',
                                params: [LISK_SEPOLIA_CONFIG],
                            });
                        } catch (addError) {
                            console.error("Failed to add Lisk Sepolia:", addError);
                            return { isConnected: false, address: null, balance: '0' };
                        }
                    } else {
                        console.error("Failed to switch network:", switchError);
                        return { isConnected: false, address: null, balance: '0' };
                    }
                }
            }

            const updatedProvider = new ethers.BrowserProvider(ethProvider);
            const rawBalance = await updatedProvider.getBalance(address);
            const balance = ethers.formatEther(rawBalance);
            const formattedBalance = parseFloat(balance).toFixed(4);

            return {
                isConnected: true,
                address,
                balance: formattedBalance,
            };

        } catch (error) {
            console.error("Wallet connection failed:", error);
            // toast.error("Connection failed");
            return { isConnected: false, address: null, balance: '0' };
        }
    },

    // 1. Create Arisan (Deploy new contract via Factory)
    createGroup: async (name: string, description: string, entryFee: string, maxParticipants: number): Promise<any> => {
        const toastId = toast.loading("Preparing transaction...");
        try {
            if (isNaN(parseFloat(entryFee)) || parseFloat(entryFee) <= 0) {
                toast.error("Invalid Entry Fee", { id: toastId });
                return null;
            }
            const ethProvider = getEthereumProvider();
            if (!ethProvider) throw new Error("MetaMask not found or conflicting wallet.");
            const provider = new ethers.BrowserProvider(ethProvider);
            const signer = await provider.getSigner();

            // Check USDT Decimals
            const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
            let decimals = 18;
            try {
                const decimalsRaw = await usdtContract.decimals();
                decimals = Number(decimalsRaw);
            } catch (err) {
                console.warn("Could not fetch decimals, using 18");
            }

            // Connect to Factory
            const sanitizedAddress = ethers.getAddress(FACTORY_ADDRESS);
            const factoryContract = new ethers.Contract(sanitizedAddress, FACTORY_ABI, signer);

            // Parse fee to Correct Units
            const feeInWei = ethers.parseUnits(entryFee, decimals);

            toast.loading("Please sign the transaction...", { id: toastId });
            const tx = await factoryContract.createArisan(name, description, feeInWei, maxParticipants, { gasLimit: 2000000 });
            console.log("Transaction sent:", tx.hash);

            toast.loading("Deploying Arisan Contract...", { id: toastId });
            const receipt = await tx.wait();

            toast.dismiss(toastId); // Dismiss loading, let component show success card
            return receipt;
        } catch (error) {
            console.error("Failed to create group:", error);
            toast.error("Failed to create Arisan.", { id: toastId });
            return null;
        }
    },

    // 2. Join Arisan (USDT Mode)
    depositFunds: async (contractAddress: string): Promise<boolean> => {
        const toastId = toast.loading("Checking requirements...");
        try {
            const ethProvider = getEthereumProvider();
            if (!ethProvider) throw new Error("MetaMask not found or conflicting wallet.");
            const provider = new ethers.BrowserProvider(ethProvider);
            const signer = await provider.getSigner();

            const arisanContract = new ethers.Contract(contractAddress, ARISAN_ABI, signer);

            // --- Pre-flight Checks ---
            const userAddress = await signer.getAddress();
            const [expectedFee, fullParticipantsList, maxParticipants] = await Promise.all([
                arisanContract.entryFee(),
                arisanContract.getParticipants(),
                arisanContract.maxParticipants()
            ]);

            // 1. Check Full
            if (fullParticipantsList.length >= Number(maxParticipants)) {
                toast.error(`Arisan is FULL (${fullParticipantsList.length}/${maxParticipants})!`, { id: toastId });
                return false;
            }

            // 2. Check Already Joined
            const dataInList = fullParticipantsList.find((p: any) => p.walletAddress === userAddress);
            if (dataInList) {
                toast.error("You have ALREADY joined this Arisan!", { id: toastId });
                return false;
            }

            // 3. Check USDT Allowance & Balance
            const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);

            // Decimals Check
            let decimals = 18;
            try {
                const decimalsRaw = await usdtContract.decimals();
                decimals = Number(decimalsRaw);
            } catch { }

            const balance = await usdtContract.balanceOf(userAddress);

            if (balance < expectedFee) {
                const formattedFee = ethers.formatUnits(expectedFee, decimals);
                toast.error(`Insufficient USDT! You need ${formattedFee} USDT.`, { id: toastId });
                return false;
            }

            const currentAllowance = await usdtContract.allowance(userAddress, contractAddress);

            // SMART APPROVE: Only if insufficient
            if (currentAllowance < expectedFee) {
                try {
                    toast.loading("Please Approve USDT first...", { id: toastId });
                    console.log(`Approving USDT... (Current: ${currentAllowance}, Need: ${expectedFee})`);
                    const approveTx = await usdtContract.approve(contractAddress, expectedFee, { gasLimit: 500000 });

                    toast.loading("Waiting for Approval confirmation...", { id: toastId });
                    await approveTx.wait();
                    console.log("USDT Approved!");
                } catch (approveError: any) {
                    console.error("Approve failed:", approveError);
                    toast.error("Approval failed.", { id: toastId });
                    return false;
                }
            } else {
                console.log("Allowance sufficient. Skipping Approve.");
            }

            console.log(`[DEBUG] Joining Arisan (USDT Mode) ${contractAddress} with fee ${expectedFee.toString()}`);

            // Call Join (Not Payable)
            toast.loading("Confirming Join Transaction...", { id: toastId });
            const tx = await arisanContract.join({ gasLimit: 800000 });
            console.log("Join Tx sent:", tx.hash);

            await tx.wait();
            toast.dismiss(toastId); // Let component show Success Card
            return true;
        } catch (error) {
            console.error("Join failed:", error);
            toast.error("Failed to join. See console.", { id: toastId });
            return false;
        }
    },

    // 3. Pick Winner (Kocok)
    pickWinner: async (contractAddress: string): Promise<any> => {
        const toastId = toast.loading("Picking a winner...");
        try {
            const ethProvider = getEthereumProvider();
            if (!ethProvider) throw new Error("MetaMask not found or conflicting wallet.");
            const provider = new ethers.BrowserProvider(ethProvider);
            const signer = await provider.getSigner();

            const arisanContract = new ethers.Contract(contractAddress, ARISAN_ABI, signer);

            const tx = await arisanContract.kocok({ gasLimit: 500000 });
            console.log("Kocok Tx sent:", tx.hash);

            toast.loading("Waiting for randomness...", { id: toastId });
            toast.loading("Waiting for randomness...", { id: toastId });
            const receipt = await tx.wait(); // Wait for confirmation

            toast.dismiss(toastId);
            return receipt;
        } catch (error) {
            console.error("Kocok failed:", error);
            toast.error("Failed to pick winner. Are you the admin?", { id: toastId });
            return null;
        }
    },

    // 3.5 Check USDT Balance
    getUSDTBalance: async (userAddress: string): Promise<string> => {
        try {
            // Use RPC for reliability
            const rpcUrl = 'https://rpc.sepolia-api.lisk.com';
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);

            // Try to fetch decimals, default to 18
            let decimals = 18;
            try {
                const decimalsRaw = await usdtContract.decimals();
                decimals = Number(decimalsRaw);
            } catch { }

            const balance = await usdtContract.balanceOf(userAddress);
            return ethers.formatUnits(balance, decimals);
        } catch (error) {
            console.error("Failed to fetch USDT balance:", error);
            return "0.00";
        }
    },

    // 3.6 Get Transaction History (Transparency Log)
    getArisanHistory: async (contractAddress: string): Promise<any[]> => {
        try {
            const rpcUrl = 'https://rpc.sepolia-api.lisk.com';
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const contract = new ethers.Contract(contractAddress, ARISAN_ABI, provider);

            // Fetch events: Joined & WinnerPicked from Arisan Contract
            const [joinedEvents, winnerEvents] = await Promise.all([
                contract.queryFilter(contract.filters.Joined()),
                contract.queryFilter(contract.filters.WinnerPicked())
            ]);

            // Fetch USDT Transfers FROM Arisan Contract (represents Claims/Payouts)
            // We need USDT contract instance
            const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
            const claimEvents = await usdtContract.queryFilter(usdtContract.filters.Transfer(contractAddress));

            const history = [
                ...joinedEvents.map((e: any) => ({
                    type: 'JOINED',
                    transactionHash: e.transactionHash,
                    blockNumber: e.blockNumber,
                    participant: e.args[0],
                    amount: ethers.formatUnits(e.args[1], 18),
                    timestamp: 0
                })),
                ...winnerEvents.map((e: any) => ({
                    type: 'WINNER',
                    transactionHash: e.transactionHash,
                    blockNumber: e.blockNumber,
                    participant: e.args[0],
                    amount: ethers.formatUnits(e.args[1], 18),
                    timestamp: Number(e.args[2])
                })),
                ...claimEvents.map((e: any) => ({
                    type: 'CLAIMED',
                    transactionHash: e.transactionHash,
                    blockNumber: e.blockNumber,
                    participant: e.args[1], // 'to' address in Transfer event
                    amount: ethers.formatUnits(e.args[2], 18), // 'value' in Transfer event
                    timestamp: 0
                }))
            ];

            // Sort by latest block first
            return history.sort((a, b) => b.blockNumber - a.blockNumber);
        } catch (error) {
            console.error("Failed to fetch history:", error);
            return [];
        }
    },


    // 4. Check Pending Prize (For User)
    checkPendingPrize: async (contractAddress: string, userAddress: string): Promise<string> => {
        try {
            const ethProvider = getEthereumProvider();
            if (!ethProvider) return '0';
            const provider = new ethers.BrowserProvider(ethProvider);
            const contract = new ethers.Contract(contractAddress, ARISAN_ABI, provider);
            const pending = await contract.pendingWithdrawals(userAddress);
            return ethers.formatEther(pending);
        } catch (error) {
            console.error("Error checking prize:", error);
            return '0';
        }
    },

    // 5. Claim Prize
    claimPrize: async (contractAddress: string): Promise<boolean> => {
        const toastId = toast.loading("Claiming your prize...");
        try {
            const ethProvider = getEthereumProvider();
            if (!ethProvider) throw new Error("MetaMask not found");
            const provider = new ethers.BrowserProvider(ethProvider);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ARISAN_ABI, signer);

            const tx = await contract.withdrawPrize({ gasLimit: 250000 });
            console.log("Claim Tx:", tx.hash);

            await tx.wait();
            toast.dismiss(toastId);
            return true;
        } catch (error) {
            console.error("Claim failed:", error);
            toast.error("Failed to claim prize.", { id: toastId });
            return false;
        }
    },

    // 6. Get All Arisans
    getAllArisans: async (): Promise<any[]> => {
        try {
            // ALWAYS USE RPC FOR FETCHING -> Ensures data visibility regardless of wallet state
            // Lisk Sepolia RPC
            const rpcUrl = 'https://rpc.sepolia-api.lisk.com';
            const provider = new ethers.JsonRpcProvider(rpcUrl);

            const sanitizedAddress = ethers.getAddress(FACTORY_ADDRESS);
            const factoryContract = new ethers.Contract(sanitizedAddress, FACTORY_ABI, provider);

            const arisanAddresses = await factoryContract.getDeployedArisans();
            console.log("Fetched Arisan Addresses:", arisanAddresses);

            const arisansData = await Promise.all(arisanAddresses.map(async (address: string) => {
                try {
                    const contract = new ethers.Contract(address, ARISAN_ABI, provider);

                    const [name, description, entryFee, maxParticipants, owner] = await Promise.all([
                        contract.name(),
                        contract.description(),
                        contract.entryFee(),
                        contract.maxParticipants(),
                        contract.owner()
                    ]);

                    // Fetch Participants
                    const rawParticipants = await contract.getParticipants();

                    const participants = rawParticipants.map((p: any) => {
                        return {
                            user: {
                                walletAddress: p.walletAddress || p[0],
                                username: `User ${(p.walletAddress || p[0]).slice(0, 4)}`,
                                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.walletAddress || p[0]}`,
                                reputationScore: 100
                            },
                            hasPaid: p.hasPaid || p[1],
                            hasWon: p.hasWon || p[2],
                            joinedAt: (p.joinedAt || p[3]).toString()
                        };
                    });

                    return {
                        id: address,
                        name: name,
                        description: description,
                        amountPerCycle: parseFloat(ethers.formatEther(entryFee)), // UI display
                        entryFeeWei: entryFee.toString(), // Store exact Wei value
                        currency: 'USDT', // NOW USDT
                        cyclePeriod: 'Weekly', // Hardcoded for now
                        maxParticipants: Number(maxParticipants),
                        currentCycle: 1,
                        status: 'OPEN',
                        poolBalance: participants.length * parseFloat(ethers.formatEther(entryFee)), // Calc pool based on participants
                        winners: [],
                        participants: participants,
                        owner: owner
                    };
                } catch (err) {
                    console.error("Error fetching arisan data for", address, err);
                    return null;
                }
            }));

            // Filter out nulls
            return arisansData.filter(g => g !== null);

        } catch (error) {
            console.error("Failed to fetch arisans:", error);
            // Fallback to empty if even RPC fails
            return [];
        }
    }
};
