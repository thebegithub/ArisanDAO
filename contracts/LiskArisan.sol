// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ArisanLisk
 * @dev A smart contract for managing digital Arisan (ROSCA) on Lisk.
 * NOTE: This contract is deployed via ArisanFactory.
 */
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArisanLisk {
    // --- State Variables ---
    address public owner; 
    IERC20 public token; // USDT Contract
    
    // Metadata
    string public name;
    string public description;
    uint256 public entryFee;        // Amount required to join (e.g., in Wei)
    uint256 public maxParticipants; // Configurable max participants
    
    struct Participant {
        address walletAddress;
        bool hasPaid;
        bool hasWon;
        uint256 joinedAt;
    }

    address[] public participantAddresses;
    mapping(address => Participant) public participants;
    address[] public winners;
    mapping(address => uint256) public pendingWithdrawals; // For Claim System

    event Joined(address indexed participant, uint256 amount);
    event WinnerPicked(address indexed winner, uint256 amount, uint256 timestamp);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // --- Constructor ---
    constructor(
        string memory _name,
        string memory _description,
        uint256 _entryFee, 
        uint256 _maxParticipants,
        address _creator,
        address _tokenAddress
    ) {
        require(_entryFee > 0, "Entry fee must be > 0");
        require(_maxParticipants > 1, "Max participants must be > 1");
        
        token = IERC20(_tokenAddress);
        name = _name;
        description = _description;
        entryFee = _entryFee;
        maxParticipants = _maxParticipants;
        owner = _creator;
    }

    // --- Main Functions ---

    // 1. Join the Arisan (Requires USDT Approval first)
    function join() external {
        // Remove msg.value check since we use ERC20
        require(participantAddresses.length < maxParticipants, "Arisan is full");
        require(participants[msg.sender].joinedAt == 0, "Already joined");

        // PULL USDT
        bool success = token.transferFrom(msg.sender, address(this), entryFee);
        require(success, "USDT Transfer failed. Check Allowance?");

        // Record participant
        participants[msg.sender] = Participant({
            walletAddress: msg.sender,
            hasPaid: true,
            hasWon: false,
            joinedAt: block.timestamp
        });
        participantAddresses.push(msg.sender);
        
        emit Joined(msg.sender, entryFee);
    }

    // 2. Kocok (Shake) / Pick Winner - Admin Only
    function kocok() external onlyOwner {
        require(token.balanceOf(address(this)) > 0, "No funds in pool");
        require(participantAddresses.length > 0, "No participants");

        // Simple randomness
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, participantAddresses.length))) % participantAddresses.length;
        address winner = participantAddresses[randomIndex];

        // Calculate Prize (Total Balance / Remaining Participants? Or just full balance? Arisan usually full pot)
        uint256 prizeAmount = token.balanceOf(address(this));
        
        // PULL PATTERN: Store in pendingWithdrawals
        pendingWithdrawals[winner] += prizeAmount;

        winners.push(winner);
        participants[winner].hasWon = true;

        emit WinnerPicked(winner, prizeAmount, block.timestamp);
    }

    // 3. Claim Prize (Withdraw USDT)
    function withdrawPrize() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;

        bool success = token.transfer(msg.sender, amount);
        require(success, "USDT Transfer failed");
    }

    // --- View Functions ---
    function getParticipants() external view returns (Participant[] memory) {
        Participant[] memory items = new Participant[](participantAddresses.length);
        for (uint256 i = 0; i < participantAddresses.length; i++) {
            items[i] = participants[participantAddresses[i]];
        }
        return items;
    }
}

/**
 * @title ArisanFactory
 * @dev Factory contract to deploy instances of ArisanLisk.
 */
contract ArisanFactory {
    address[] public deployedArisans;
    
    // Hardcoded USDT for simplicity, or pass it in? User asked for specific USDT.
    // Let's allow passing it or storing it.
    address public usdtToken;

    event ArisanCreated(address indexed arisanAddress, address indexed creator, string name, uint256 entryFee);

    constructor(address _usdtToken) {
        usdtToken = _usdtToken;
    }

    function createArisan(
        string memory _name,
        string memory _description,
        uint256 _entryFee,
        uint256 _maxParticipants
    ) external {
        // Deploy new ArisanLisk with USDT
        ArisanLisk newArisan = new ArisanLisk(_name, _description, _entryFee, _maxParticipants, msg.sender, usdtToken);
        
        deployedArisans.push(address(newArisan));
        
        emit ArisanCreated(address(newArisan), msg.sender, _name, _entryFee);
    }

    function getDeployedArisans() external view returns (address[] memory) {
        return deployedArisans;
    }
}
