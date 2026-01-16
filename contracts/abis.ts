// USDT Token Address (Lisk Sepolia)
export const USDT_ADDRESS = "0x952E20BED7b51195512Cfd31A30AC6C4bc7cb714";

// NOTE: User MUST Update this after redeploying Factory with USDT support!
export const FACTORY_ADDRESS = "0x6af78564BBC62f9f8D15925103969bFf71C06185";

export const FACTORY_ABI = [
    "function createArisan(string _name, string _description, uint256 _entryFee, uint256 _maxParticipants) external",
    "function getDeployedArisans() view returns (address[])",
    "event ArisanCreated(address indexed arisanAddress, address indexed creator, string name, uint256 entryFee)"
];

export const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

export const ARISAN_ABI = [
    "function join() external", // Not payable anymore (ERC20 Approve pattern)
    "function kocok() external",
    "function getParticipants() external view returns (tuple(address walletAddress, bool hasPaid, bool hasWon, uint256 joinedAt)[])",
    "function owner() view returns (address)",
    "function name() view returns (string)",
    "function description() view returns (string)",
    "function entryFee() view returns (uint256)",
    "function maxParticipants() view returns (uint256)",
    "function participantAddresses(uint256) view returns (address)",
    "function participants(address) view returns (address walletAddress, bool hasPaid, bool hasWon, uint256 joinedAt)",
    "function pendingWithdrawals(address) view returns (uint256)",
    "function withdrawPrize()",
    "event Joined(address indexed participant, uint256 amount)",
    "event WinnerPicked(address indexed winner, uint256 amount, uint256 timestamp)"
];
