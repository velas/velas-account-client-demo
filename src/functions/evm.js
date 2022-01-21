import Web3 from 'web3';

import { vaclient } from './vaclient';

function EVM(options) {
    this.web3 = new Web3(vaclient.provider);
};

EVM.prototype.transfer = async function(from, cb) {

    let csrf_token = null;

    try {
        const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
        const { token } = await response.json();
        csrf_token = token;
    } catch (error) {
        throw new Error("csrf host is not available");
    };

    const nonce = await this.web3.eth.getTransactionCount(from)

    this.web3.eth.sendTransaction({
        nonce,
        from,
        to:       '0xB90168C8CBcd351D069ffFdA7B71cd846924d551',
        value:    this.web3.utils.toHex(this.web3.utils.toWei('0.01', 'ether')),
        gas:      this.web3.utils.toHex(21000),
        gasPrice: this.web3.utils.toHex(0),
        broadcast: true,
        csrf_token,
    }).then(cb).catch(cb);
};

EVM.prototype.contract = async function(from, cb) {

    const storage = new this.web3.eth.Contract([
        {
            "inputs": [],
            "name": "retrieve",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "num",
                    "type": "uint256"
                }
            ],
            "name": "store",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ], '0x4E7C88bca3085276C79f86ef892609014708C283');

    let csrf_token = null;

    try {
        const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
        const { token } = await response.json();
        csrf_token = token;
    } catch (error) {
        throw new Error("csrf host is not available");
    };

    const nonce = await this.web3.eth.getTransactionCount(from)

    storage.methods.store("123").send({
        "from": from,
        "nonce": nonce,
         gas:      this.web3.utils.toHex(21000),
         gasPrice: this.web3.utils.toHex(0),
         broadcast: true,
         csrf_token,
    })
    .on('error', function(error){ 
        console.log(error);
        cb('Transaction failed: see conole logs', null)
    })
    .on('receipt', function(receipt){
       cb(null, receipt.transactionHash)
       console.log("receipt", receipt)
    })
};

EVM.prototype.getBalance = async function(address) {
    var balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
};

export default new EVM();
