
const { ethers } = require("ethers");

const ARISAN_ABI = [
    "function owner() view returns (address)",
    "function token() view returns (address)",
    "function getParticipants() view returns (tuple(address walletAddress, bool hasPaid, bool hasWon, uint256 joinedAt)[])",
    "function participantAddresses(uint256) view returns (address)",
    "function entryFee() view returns (uint256)"
];

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const CONTRACT_ADDRESS = "0xEe5Ab480dc1CEDAe9F8D6F93e1D99723C7eB29DF";
const RPC_URL = "https://rpc.sepolia-api.lisk.com";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ARISAN_ABI, provider);

    console.log("--- DIANOZING ARISAN II ---");

    try {
        const entryFee = await contract.entryFee();
        console.log("ENTRY FEE (Wei):", entryFee.toString());

        const tokenAddress = await contract.token();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const decimals = await tokenContract.decimals();

        console.log("ENTRY FEE (USDT):", ethers.formatUnits(entryFee, decimals));

        const balance = await tokenContract.balanceOf(CONTRACT_ADDRESS);
        console.log("CONTRACT BALANCE:", ethers.formatUnits(balance, decimals));

    } catch (e) {
        console.error("ERROR:", e);
    }
}

main();
