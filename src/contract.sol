// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract AddressRegistry {
    // USDC token contract on Ethereum mainnet
    IERC20 public usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    
    // Payment recipient address
    address public paymentRecipient = 0x5B759eF9085C80CCa14F6B54eE24373f8C765474;
    
    // Required payment amount (1 USDC = 1,000,000 units since USDC has 6 decimals)
    uint256 public constant PAYMENT_AMOUNT = 1000000;
    
    // Struct to store user information
    struct UserInfo {
        string physicalAddress;
        address walletAddress;
        uint256 timestamp;
    }
    
    // Array to store all users who have made payments
    UserInfo[] public users;
    
    // Mapping to check if a wallet address has already registered
    mapping(address => bool) public hasRegistered;
    
    // Event emitted when a new address is registered
    event AddressRegistered(address indexed walletAddress, string physicalAddress, uint256 timestamp);
    
    /**
     * @dev Register a physical address by making a USDC payment
     * @param _physicalAddress The physical address to register
     */
    function registerAddress(string memory _physicalAddress) external {
        require(!hasRegistered[msg.sender], "Address already registered");
        require(bytes(_physicalAddress).length > 0, "Physical address cannot be empty");
        
        // Check if the user has approved the contract to spend USDC
        require(usdc.allowance(msg.sender, address(this)) >= PAYMENT_AMOUNT, "Insufficient USDC allowance");
        
        // Transfer USDC from user to payment recipient
        bool success = usdc.transferFrom(msg.sender, paymentRecipient, PAYMENT_AMOUNT);
        require(success, "USDC transfer failed");
        
        // Store the user information
        users.push(UserInfo({
            physicalAddress: _physicalAddress,
            walletAddress: msg.sender,
            timestamp: block.timestamp
        }));
        
        // Mark the wallet address as registered
        hasRegistered[msg.sender] = true;
        
        // Emit event
        emit AddressRegistered(msg.sender, _physicalAddress, block.timestamp);
    }
    
    /**
     * @dev Retrieve registered addresses in paginated form to avoid gas limit issues
     * @param _offset Starting index
     * @param _limit Maximum number of entries to return
     * @return Paginated array of registered user information
     */
    function retrieveAddresses(uint256 _offset, uint256 _limit) external view returns (UserInfo[] memory) {
        // Calculate the actual number of entries to return
        uint256 endIndex = _offset + _limit;
        if (endIndex > users.length) {
            endIndex = users.length;
        }
        
        // Calculate the actual count of entries
        uint256 resultCount = endIndex > _offset ? endIndex - _offset : 0;
        
        UserInfo[] memory result = new UserInfo[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = users[_offset + i];
        }
        
        return result;
    }
    
    /**
     * @dev Get the total number of registered addresses
     * @return The count of registered addresses
     */
    function getTotalRegistrations() external view returns (uint256) {
        return users.length;
    }
    
    /**
     * @dev Check if a specific wallet address has registered
     * @param _walletAddress The wallet address to check
     * @return Whether the address has registered
     */
    function isRegistered(address _walletAddress) external view returns (bool) {
        return hasRegistered[_walletAddress];
    }
}