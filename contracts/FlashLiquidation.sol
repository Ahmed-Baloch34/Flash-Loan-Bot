// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract FlashLiquidation is FlashLoanSimpleReceiverBase, Ownable {
    
    // ✅ CONFIGURATION FOR BASE MAINNET
    ISwapRouter public immutable swapRouter;
    
    // Base Mainnet Uniswap V3 Router
    address constant SWAP_ROUTER_ADDRESS = 0x2626664c2603336E57B271c5C0b26F421741e481;

    constructor(address _addressProvider) 
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider)) 
        Ownable(msg.sender) // Set deployer as owner
    {
        swapRouter = ISwapRouter(SWAP_ROUTER_ADDRESS);
    }

    // -----------------------------------------------------------------
    // 1️⃣ STEP 1: HUMARA BOT YAHAN CALL KAREGA (Trigger)
    // -----------------------------------------------------------------
    function executeLiquidation(
        address _assetToBorrow, // Jo currency loan leni hai (e.g. USDC)
        uint256 _amountToBorrow, // Kitna loan lena hai
        address _targetUser,     // Kisko udana hai
        address _collateralAsset // Uske pass kya girvi rakha hai (e.g. WETH)
    ) external onlyOwner {
        
        // Data pack karo taaki Flash Loan function mein bhej sakein
        bytes memory params = abi.encode(_targetUser, _collateralAsset);

        // Aave ko bolo: "Paisa do!"
        POOL.flashLoanSimple(
            address(this),
            _assetToBorrow,
            _amountToBorrow,
            params,
            0 // Referral code (0)
        );
    }

    // -----------------------------------------------------------------
    // 2️⃣ STEP 2: AAVE PAISA DENE KE BAAD YAHAN AAYEGA (Operation)
    // -----------------------------------------------------------------
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // Data unpack karo
        (address targetUser, address collateralAsset) = abi.decode(params, (address, address));

        // 1. Aave Pool ko permission do ki wo humara paisa use kar sake liquidation ke liye
        IERC20(asset).approve(address(POOL), amount);

        // ⚔️ 2. ATTACK: Liquidation Call
        // Hum Aave ko bolte hain: "Ye lo iska loan wapas, iska collateral mujhe do"
        try POOL.liquidationCall(
            collateralAsset,
            asset,
            targetUser,
            amount,
            false // receiveAToken (False = humein asli token chahiye, aToken nahi)
        ) {
            // Agar liquidation successful hua, toh Collateral becho
            uint256 collateralBalance = IERC20(collateralAsset).balanceOf(address(this));
            if (collateralBalance > 0) {
                _swapCollateralToDebt(collateralAsset, asset, collateralBalance);
            }
        } catch {
            // Agar fail hua, toh kuch mat karo, bas loan wapas karne ki tayari karo
        }

        // 3. Aave ka Paisa Wapas (Amount + Fees)
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        // 4. PROFIT CALCULATION
        uint256 remainingBalance = IERC20(asset).balanceOf(address(this));
        
        // Agar Aave ko dene ke baad paisa bacha, wo humara PROFIT hai!
        if (remainingBalance > amountOwed) {
            uint256 profit = remainingBalance - amountOwed;
            IERC20(asset).transfer(owner(), profit); // Profit seedha aapke wallet mein
        }

        return true;
    }

    // -----------------------------------------------------------------
    // 3️⃣ STEP 3: COLLATERAL BECH KAR LOAN WAPAS KARNA (Swapping)
    // -----------------------------------------------------------------
    function _swapCollateralToDebt(
        address tokenIn,  // Collateral (e.g., WETH)
        address tokenOut, // Debt Asset (e.g., USDC)
        uint256 amountIn
    ) internal {
        // Approve Uniswap to sell our token
        IERC20(tokenIn).approve(address(swapRouter), amountIn);

        // Uniswap V3 Swap settings
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: 3000, // 0.3% Fee tier (Standard)
                recipient: address(this), // Wapas contract mein paisa aana chahiye
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0, // Slippage logic (Production mein isse better rakhna)
                sqrtPriceLimitX96: 0
            });

        // Bech do!
        try swapRouter.exactInputSingle(params) {} catch {}
    }

    // 🚨 EMERGENCY WITHDRAW (Agar paisa phans jaye)
    function withdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(msg.sender, balance);
    }
}