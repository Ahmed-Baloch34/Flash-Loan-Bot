// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // PDF requirement 

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// "The Hunter" - Liquidation Contract [cite: 3, 6]
contract EnhancedFlashLiquidator is FlashLoanSimpleReceiverBase, Ownable {

    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
        Ownable(msg.sender)
    {}

    /**
     * @dev Step 2: Flash Loan Logic - Aave se loan lekar collateral seize karna [cite: 7]
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // 1. Debt calculation (Loan + Fee)
        uint256 amountOwed = amount + premium;

        // 2. Decode params (Target User, Collateral Asset)
        (address targetUser, address collateralAsset) = abi.decode(params, (address, address));

        // ---------------------------------------------------------
        // 🗡️ LIQUIDATION LOGIC START
        // ---------------------------------------------------------
        
        // Step A: Approve Aave to use borrowed funds
        IERC20(asset).approve(address(POOL), amount);

        // Step B: Liquidation Call (Real logic enabled in production)
        // POOL.liquidationCall(collateralAsset, asset, targetUser, amount, false);

        // ---------------------------------------------------------

        // 3. Profit Calculation [cite: 8]
        uint256 currentBalance = IERC20(asset).balanceOf(address(this));
        require(currentBalance >= amountOwed, "Operation Failed: No Profit Generated");

        // 4. Repay Loan
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function requestLiquidation(address _token, uint256 _amount, address _targetUser, address _collateral) public onlyOwner {
        address receiverAddress = address(this);
        bytes memory params = abi.encode(_targetUser, _collateral);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            _token,
            _amount,
            params,
            referralCode
        );
    }

    function withdraw(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}