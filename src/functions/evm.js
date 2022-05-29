import Web3 from 'web3';
import BN from 'bn.js';

import { vaclient } from './vaclient';

function EVM(from) {
    this.from     = from;
    this.web3     = new Web3(vaclient.provider);
    this.gas      = 50000;
    this.gasPrice = 2000000001;
    this.decimal  = 1000000000000000000;

    this.symbols = {
        '0x1344531e3d3bceab05a102a75086a249a1d9cd36': 'USDT',
        '0x1ac1c42ab2c84a3c9f859a52f9eddfef83b7602a': 'BUSD',
        '0x50ced6b58b829d541526137da3dc179cfcf8274e': 'USDC',
        '0xa3147291d4b0363e1810f6567c7696f692ab918f': 'ETH',
    };

    this.maxFee    = Math.ceil((this.gas * this.gasPrice) / this.decimal*100000)/100000;
    this.donateVLX = 1;

    this.countractAddress = '0x9b2e0Bb20D4B3e2456B509029662EDbDFba2a09a';
    this.donateAddress    = '0xACF8ef3c3f5536513429629428F8324a5D634b39';

    this.storage = new this.web3.eth.Contract([{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"num","type":"uint256"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"StoreNumber","type":"event"},{"inputs":[],"name":"retrieve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"num","type":"uint256"}],"name":"store","outputs":[],"stateMutability":"nonpayable","type":"function"}], this.countractAddress);
    this.erc20   = new this.web3.eth.Contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}], '0x1344531e3d3bceab05a102a75086a249a1d9cd36')
};

EVM.prototype.getBalance = async function() {
    var balance = await this.web3.eth.getBalance(this.from);
        balance = this.web3.utils.fromWei(balance, 'ether');
        balance = Math.floor(balance*100000)/100000;

        this.balance = balance;

        return balance;
};

EVM.prototype.getUSDTBalance = async function() {
    var balance = await this.erc20.methods.balanceOf(this.from).call();

        balance = this.web3.utils.fromWei(balance);
        balance = Math.floor(balance*100000)/100000;

        this.balanceUSDT = balance;

        return balance;
};

EVM.prototype.amountToValue = function(amount, decimal) {
    decimal = decimal ? '1'.padEnd(decimal, '0') : this.decimal;

    var balance = amount;
        balance = balance / this.decimal;
        balance = Math.floor(balance*100000)/100000;

        return balance;
};

EVM.prototype.tokenAddressToSymbol = function(address) {
    const knownSymbol = this.symbols[address];
    return knownSymbol || 'UNKNOWN'
};

EVM.prototype.transactions = async function(address, cb) {
    try {
        if (!process.env.REACT_APP_HISTORY_HOST) {
            cb([]);
            return;
        }
        const response = await fetch(`${process.env.REACT_APP_HISTORY_HOST}/transactions/${address}`);
        const result   = await response.json();

        cb(result)
    } catch (error) {
        cb([]);
    };
};

EVM.prototype.events = async function(cb) {
    try {
        const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/history`);
        const result   = await response.json();
        const items = result.history ? result.history.reverse().map(item => {

            if (item.to === '0x1344531e3d3bceab05a102a75086a249a1d9cd36' && item.input.substring(0,10) === '0xa9059cbb') {
                let amount = this.amountToValue(parseInt(item.input.substring(74), 16));

                return {
                    type: 1,
                    from: item.from.toLowerCase(),
                    value: `USDT ${amount}`,
                    hash: item.hash,
                };
            };

            if (item.to === this.donateAddress.toLowerCase()) {
                let amount = this.web3.utils.fromWei(item.value, 'ether');
                    amount = Math.floor(amount*100000)/100000;

                return {
                    type: 1,
                    from: item.from.toLowerCase(),
                    value: `VLX ${amount}`,
                    hash: item.hash,
                };
            };

            if (item.to === this.countractAddress.toLowerCase()) {
                return {
                    type: 2,
                    from: item.from.toLowerCase(),
                    value: `Hi there!`,
                    hash: item.hash,
                };

            };

            return {
                type: 2,
                from: '0x0',
                value: `Hi there!`,
                hash: '0x0',
            };
        }) : [];

        cb(items)
    } catch (error) {
        cb([]);
    };
};

EVM.prototype.transfer = async function(cb) {
    if (this.balance < (this.donateVLX + this.maxFee)) {
        cb(`No enough VLX for this transaction ${ this.donateVLX + this.maxFee } VLX`, null);
        return;
    };

    let csrf_token = null;

    try {
        const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
        const { token } = await response.json();
        csrf_token = token;
    } catch (error) {
        cb("csrf host is not available", null);
        return;
    };

    const nonce = await this.web3.eth.getTransactionCount(this.from);

    var a = new BN(this.donateVLX);
    var b = new BN(this.decimal.toString());
    const amountBN = a.mul(b)

    const raw = {
        nonce,
        from:     this.from,
        to:       this.donateAddress,
        value:    this.web3.utils.toHex(amountBN.toString()),
        gas:      this.web3.utils.toHex(this.gas),
        gasPrice: this.web3.utils.toHex(this.gasPrice),
        broadcast: true,
        csrf_token,
    };

    this.web3.eth.sendTransaction(raw).then(cb).catch(cb);
};

EVM.prototype.transferUSDT = async function(cb) {
    if (this.balance < this.maxFee) {
        cb(`No enough VLX for this transaction (${ this.maxFee } VLX).`, null);
        return;
    };

    if (this.balanceUSDT < this.donateVLX) {
        cb(`No enough USDT for this transaction (${ this.maxFee } VLX).`, null);
        return;
    };

    let csrf_token = null;

    try {
        const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
        const { token } = await response.json();
        csrf_token = token;
    } catch (error) {
        throw new Error("csrf host is not available");
    };

    this.nonce = await this.web3.eth.getTransactionCount(this.from);

    const raw = {
        nonce:    this.nonce,
        from:     this.from,
        gas:      this.web3.utils.toHex(this.gas),
        gasPrice: this.web3.utils.toHex(this.gasPrice),
        broadcast: true,
        csrf_token,
    };

    this.erc20.methods.transfer(this.donateAddress, String(this.donateVLX * this.decimal)).send(raw)
        .on('error', function(error){ 
            cb(error.message, null)
        })
        .on('receipt', function(receipt){
            cb(null, receipt.transactionHash)
        });
};

EVM.prototype.contract = async function(cb) {
    if (this.balance < this.maxFee) {
        cb(`No enough VLX for this transaction (${ this.maxFee } VLX).`, null);
        return;
    };

    let csrf_token = null;

    try {
        const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
        const { token } = await response.json();
        csrf_token = token;
    } catch (error) {
        throw new Error("csrf host is not available");
    };

    this.nonce = await this.web3.eth.getTransactionCount(this.from);

    const raw = {
        nonce:    this.nonce,
        from:     this.from,
        gas:      this.web3.utils.toHex(this.gas),
        gasPrice: this.web3.utils.toHex(this.gasPrice),
        broadcast: true,
        csrf_token,
    };

    this.storage.methods.store("0").send(raw)
    .on('error', function(error){ 
        cb(error.message, null)
    })
    .on('receipt', function(receipt){
       cb(null, receipt.transactionHash)
    });
};

export default EVM;
