
const { ethers } = require("ethers");

// Config
const RPC_URL = "https://rpc.sepolia-api.lisk.com";
const FACTORY_ADDRESS = "0x6af78564BBC62f9f8D15925103969bFf71C06185"; // From abis.ts
const EXPECTED_USDT = "0x952E20BED7b51195512Cfd31A30AC6C4bc7cb714"; // From abis.ts

const FACTORY_ABI = [
    "function getDeployedArisans() view returns (address[])"
];

const ARISAN_ABI = [
    "function token() view returns (address)",
    "function entryFee() view returns (uint256)",
    "function owner() view returns (address)"
];

const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)"
];

async function main() {
    console.log("--- DIAGNOSTIC START ---");
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // 1. Check Factory
    console.log(`Checking Factory at: ${FACTORY_ADDRESS}`);
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

    let arisans = [];
    try {
        arisans = await factory.getDeployedArisans();
        console.log(`Found ${arisans.length} deployed Arisans.`);
    } catch (e) {
        console.error("FATAL: Could not fetch Arisans from Factory. Wrong Factory Address?", e.message);
        return;
    }

    if (arisans.length === 0) {
        console.warn("No Arisans found. Cannot check Arisan state.");
    } else {
        // 2. Check Latest Arisan
        const lastArisan = arisans[arisans.length - 1];
        console.log(`Inspecting LATEST Arisan: ${lastArisan}`);

        const arisan = new ethers.Contract(lastArisan, ARISAN_ABI, provider);

        let tokenAddress;
        try {
            tokenAddress = await arisan.token();
        } catch (e) {
            console.log("Could not fetch token from Arisan. ABI mismatch?");
        }

        if (tokenAddress) {
            console.log(`Arisan uses Token: ${tokenAddress}`);
            console.log(`Expected Token:    ${EXPECTED_USDT}`);

            if (tokenAddress.toLowerCase() !== EXPECTED_USDT.toLowerCase()) {
                console.error("MISMATCH! Arisan is using a DIFFERENT token than configured in frontend!");
            } else {
                console.log("MATCH: Arisan is using the configured USDT.");
            }
        }

        try {
            const entryFee = await arisan.entryFee();
            console.log(`Arisan Entry Fee (Wei): ${entryFee.toString()}`);
        } catch (e) {
            console.log("Could not fetch entryFee.");
        }
    }

    // 3. Check USDT Details
    console.log(`Inspecting USDT at: ${EXPECTED_USDT}`);
    const usdt = new ethers.Contract(EXPECTED_USDT, ERC20_ABI, provider);

    try {
        const decimals = await usdt.decimals();
        const symbol = await usdt.symbol();
        console.log(`Token Symbol: ${symbol}`);
        console.log(`Token Decimals: ${decimals}`);
    } catch (e) {
        console.error("FATAL: Could not fetch USDT details. Wrong USDT Address?", e.message);
    }
    console.log("--- DIAGNOSTIC END ---");
}

main().catch(console.error);
