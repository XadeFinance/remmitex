const ethers = require("ethers");
const {DefenderRelayProvider, DefenderRelaySigner} = require("defender-relay-client/lib/ethers");

const pendingPoolABI = [ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" } ], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "Recepient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "Value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "Token", "type": "address" } ], "name": "PaymentRedeemed", "type": "event" }, { "inputs": [ { "internalType": "contract IERC20Upgradeable", "name": "_token", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "candidate", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "contract IERC20Upgradeable", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "contract IERC20Upgradeable", "name": "_token", "type": "address" }, { "internalType": "address", "name": "_recipient", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" } ], "name": "redeem", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "redeemer", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "setOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_redeemer", "type": "address" } ], "name": "setRedeemer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "updateOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]

exports.main = async function(signer, token, recipient, value) {
    const pendingPoolAddr = "0xfBEa2B0397111770803113e3257DdE4570cb0193";
    const pendingPool = new ethers.Contract(pendingPoolAddr, pendingPoolABI, signer);

    const txReceipt = await pendingPool.redeem(token, recipient, value);
    return txReceipt.status
}

//entry point for autotask
exports.handler = async function(event) {
    const provider = new DefenderRelayProvider(event);
    const signer = new DefenderRelaySigner(event, provider, {speed: 'fast'});

    const {
        body,    // Object with JSON-parsed POST body
        headers, // Object with key-values from HTTP headers
        queryParameters, // Object with key-values from query parameters
    } = event.request;

    const {
        token,
        recipient,
        value
    } = [body.token, body.recipient, body.value];
    return exports.main(signer, token, recipient, value)
}

//To run script locally
if (require.main === module) {
    require("dotenv").config();
    const {API_KEY: apiKey, API_SECRET: apiSecret} = process.env;
    exports.handler({apiKey, apiSecret})
    .then(() => process.exit(0))
    .catch(error => {console.error(error); process.exit(1);})
}
