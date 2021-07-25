import Web3        from 'web3';

import { client } from '../functions/auth';

function EVM(options) {
    this.web3 = new Web3(client.provider);
};

EVM.prototype.transfer = async function(from, cb) {

    const nonce = await this.web3.eth.getTransactionCount(from)

    this.web3.eth.sendTransaction({
        nonce,
        from,
        to:   '0xB90168C8CBcd351D069ffFdA7B71cd846924d551',
        value: this.web3.utils.toWei('0.01', 'ether'),
    })
        .then(cb)
        .catch(cb);
};

EVM.prototype.getBalance = async function(address) {
    var balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
};

export default new EVM();
