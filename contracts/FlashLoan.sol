// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract FlashLoan is FlashLoanSimpleReceiverBase {
    address payable owner;

    // ✅ FIXED ADDRESSES (Checksum Corrected)
    address private constant UNISWAP_ROUTER = 0xC532A74256d3Db42D0Bf7A0acF5f48dA19818132; 
    address private constant SUSHISWAP_ROUTER = 0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;

    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        owner = payable(msg.sender);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        uint256 amountOwed = amount + premium;

        // ---------------------------------------------------------
        // 🤖 ARBITRAGE LOGIC STARTS
        // ---------------------------------------------------------

        IERC20(asset).approve(UNISWAP_ROUTER, amount);

        // ---------------------------------------------------------
        // 🤖 ARBITRAGE LOGIC ENDS
        // ---------------------------------------------------------

        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    function withdraw(address tokenAddress) external {
        require(msg.sender == owner, "Only Owner");
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
    
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
}