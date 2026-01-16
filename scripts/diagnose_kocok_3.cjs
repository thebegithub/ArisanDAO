
const { ethers } = require("ethers");

const ARISAN_ABI = [
    "function winners(uint256) view returns (address)",
    "function getParticipants() view returns (tuple(address walletAddress, bool hasPaid, bool hasWon, uint256 joinedAt)[])",
    "function pendingWithdrawals(address) view returns (uint256)"
];

const CONTRACT_ADDRESS = "0xEe5Ab480dc1CEDAe9F8D6F93e1D99723C7eB29DF";
const RPC_URL = "https://rpc.sepolia-api.lisk.com";

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ARISAN_ABI, provider);

    console.log("--- DIANOZING ARISAN III ---");

    try {
        // Check Winners
        let winnersCount = 0;
        try {
            // Arrays don't have a length getter in ethers simple interface usually? 
            // We can try accessing index 0.
            await contract.winners(0);
            winnersCount = 1; // At least 1
            await contract.winners(1);
            winnersCount = 2;
        } catch (e) {
            // End of array
        }
        console.log("WINNERS DETECTED (Approx):", winnersCount > 0 ? "YES" : "NO");

        // Check Pending Withdrawals for participants
        const participants = await contract.getParticipants();
        for (const p of participants) {
            const pending = await contract.pendingWithdrawals(p.walletAddress);
            console.log(`Pending for ${p.walletAddress}: ${ethers.formatUnits(pending, 18)}`);
        }

    } catch (e) {
        console.error("ERROR:", e);
    }
}

main();
