export const ARISAN_ABI = [
    // Read Functions
    "function entryFee() view returns (uint256)",
    "function getParticipantsCount() view returns (uint256)",
    "function getBalance() view returns (uint256)",
    "function owner() view returns (address)",
    "function participants(uint256) view returns (address)",

    // Write Functions
    "function joinArisan() payable",
    "function startNewRound(uint256 _newFee)",
    "function pickWinner()",
    "function emergencyWithdraw()",

    // Events
    "event RoundStarted(uint256 fee)",
    "event ParticipantJoined(address indexed player, uint256 amount)",
    "event WinnerPicked(address indexed winner, uint256 prizeAmount)",
    "event Withdrawal(address indexed owner, uint256 amount)"
];

// Alamat Contract (Harus diisi dengan alamat contract yang sudah dideploy di Lisk Testnet)
// User perlu mengubah ini nanti
export const CONTRACT_ADDRESS = "0xeB3265E03aE8e8AC071351B117475D5d7DFB752A"; 
