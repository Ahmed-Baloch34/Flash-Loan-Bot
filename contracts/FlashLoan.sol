// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Aave aur OpenZeppelin ki libraries import kar rahe hain
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FlashLoan is FlashLoanSimpleReceiverBase {
    address payable owner;

    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        owner = payable(msg.sender);
    }

    /**
        Ye function TAB chalega jab Aave humein paisa bhej dega.
        Yahan hum arbitrage/liquidation karenge.
    */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // 1. Yahan hum check kar sakte hain ki paisa aaya ya nahi
        // (Logic baad mein daalenge, abhi bas loan wapas kar rahe hain)
        
        // 2. Udhaar chukane ke liye total amount calculate karo
        // (Amount + Thodi si fees)
        uint256 amountToReturn = amount + premium;

        // 3. Aave ko permission do ki wo hamare account se paise wapas le le
        IERC20(asset).approve(address(POOL), amountToReturn);

        return true;
    }

    /**
        Ye function hum call karenge loan lene ke liye
    */
    function requestFlashLoan(address _token, uint256 _amount) public {
        address receiverAddress = address(this);
        address asset = _token;
        uint256 amount = _amount;
        bytes memory params = "";
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }

    // Contract se paise nikalne ke liye (Emergency Withdraw)
    function withdraw(address _tokenAddress) external {
        IERC20 token = IERC20(_tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    receive() external payable {}
}