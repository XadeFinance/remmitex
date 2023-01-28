// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.6;

import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { XadeOwnableUpgrade } from "./utils/XadeOwnableUpgrade.sol";

contract PendingPool is XadeOwnableUpgrade {

    event PaymentRedeemed(address Recepient, uint256 Value, address Token);

    modifier onlyRedeemer() {
        require(redeemer == _msgSender(), "PendingPool: caller not redeemer");
        _;
    }
     
    // Cannot change order of the state variables below
    address public redeemer;
    uint256[50] private __gap;
    // Cannot change order of the state variables above

    //◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤ add state variables below ◥◤◥◤◥◤◥◤◥◤◥◤◥◤◥◤//

    //◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣ add state variables above ◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣//

    function initialize() public initializer {
        __Ownable_init();
    }

    function deposit(IERC20Upgradeable _token, uint256 _value) external {
        require(_value != 0, "PendingPool: Invalid amount");
        require(_token.transferFrom(_msgSender(), address(this), _value), "Transfer failed");
    }

    function redeem(IERC20Upgradeable _token, address _recipient, uint256 _value) external onlyRedeemer {
        require(_recipient != address(0), "Recipient cannot be zero address");
        require(_token.transfer(_recipient, _value), "Transfer failed");
        emit PaymentRedeemed(_recipient, _value, address(_token));
    }

    function balanceOf(IERC20Upgradeable _token) external view returns (uint256) {
        return _token.balanceOf(address(this));
    }

    function setRedeemer(address _redeemer) external onlyOwner {
        redeemer = _redeemer;
    }
}
