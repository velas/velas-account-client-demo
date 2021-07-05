import keccak256 from 'keccak256';
import Web3      from 'web3';

import { client } from '../functions/auth';

function EVM(options) {
    this.web3 = new Web3(client.provider);
};

EVM.prototype.transfer = function(addressFrom, addressTo) {
    this.web3.eth.sendTransaction({
        nonce: 1,
        from: addressFrom,
        to: addressTo,
        value: this.web3.utils.toWei('0.01', 'ether'),
        gas_price: 1,
        gas_limit: 3000000,
    })
        .then(console.log)
        .catch(console.log);
};

EVM.prototype.getAddressFrom = function(address) {
    const pref = Buffer.from([0xAC, 0xC0]);
    const hash = keccak256(address);
    return "0x" + Buffer.concat([pref, hash.slice(2, 20)]).toString("hex");
};

EVM.prototype.getBalance = async function(address) {
    var balance = await this.web3.eth.getBalance(address);
    var wallet = this.web3.utils.fromWei(balance, 'ether');
    return wallet;
};

export default new EVM();
