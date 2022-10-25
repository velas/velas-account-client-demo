import Web3 from 'web3';
import BN from 'bn.js';
import BigNumber from 'bignumber.js'

import { vaclient } from './vaclient';

function EVM(from) {
    this.from     = from;
    this.web3     = new Web3(vaclient.provider);
    this.gas      = 50000;
    this.gasPrice = 2000000001;
    this.decimal  = 1000000000000000000;

    if(process.env.REACT_APP_NETWORK_HOST === 'https://api.mainnet.velas.com') {
        this.symbols = {
            '0x01445c31581c354b7338ac35693ab2001b50b9ae': 'USDT',
            '0xc111c29a988ae0c0087d97b33c6e6766808a3bd3': 'BUSD',
            '0xe2c120f188ebd5389f71cf4d9c16d05b62a58993': 'USDC',
            '0x85219708c49aa701871ad330a94ea0f41dff24ca': 'ETH',
            '0xcd7509b76281223f5b7d3ad5d47f8d7aa5c2b9bf': 'USDV',
            '0x8a74bc8c372bc7f0e9ca3f6ac0df51be15aec47a': 'PLSPAD',
            '0x8d9fb713587174ee97e91866050c383b5cee6209': 'SCAR',
            '0x9ab70e92319f0b9127df78868fd3655fb9f1e322': 'WWY',
            '0x9b6fbf0ea23faf0d77b94d5699b44062e5e747ac': 'SWAPZ',
            '0x09bce7716d46459df7473982fd27a96eabd6ee4d': 'BITORB',
            '0x72eb7ca07399ec402c5b7aa6a65752b6a1dc0c27': 'ASTRO',
            '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c': 'WBTC',
            '0x2217e5921b7edfb4bb193a6228459974010d2198': 'QMALL',
            '0x32561fa6d2d3e2191bf50f813df2c34fb3c89b62': 'VERVE',
            '0x62858686119135cc00c4a3102b436a0eb314d402': 'METAV',
            '0xa065e0858417dfc7abc6f2bd4d0185332475c180': 'VLXPAD',
            '0xabf26902fd7b624e0db40d31171ea9dddf078351': 'WAG',
            '0xc9f020b8e6ef6c5c34483ab4c3a5f45661e8f26e': 'VINU',
            '0xd12f7a98c0d740e7ec82e8caf94eb79c56d1b623': 'VDGT',
            '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d': 'DAI',
            '0x2b8e9cd44c9e09d936149549a8d207c918ecb5c4': 'BNB',
        };
    } else if (process.env.REACT_APP_NETWORK_HOST === 'https://api.testnet.velas.com') {
        this.symbols = {
            '0x1344531e3d3bceab05a102a75086a249a1d9cd36': 'USDT',
            '0x1ac1c42ab2c84a3c9f859a52f9eddfef83b7602a': 'BUSD',
            '0x50ced6b58b829d541526137da3dc179cfcf8274e': 'USDC',
            '0xa3147291d4b0363e1810f6567c7696f692ab918f': 'ETH',
        };
    } else {
        this.symbols = {
            '0x1344531e3d3bceab05a102a75086a249a1d9cd36': 'USDT',
            '0x1ac1c42ab2c84a3c9f859a52f9eddfef83b7602a': 'BUSD',
            '0x50ced6b58b829d541526137da3dc179cfcf8274e': 'USDC',
            '0xa3147291d4b0363e1810f6567c7696f692ab918f': 'ETH',
        };
    };

    this.maxFee       = Math.ceil((this.gas * this.gasPrice) / this.decimal*100000)/100000;
    this.donateAmount = 0.01;

    this.countractAddress = '0x9b2e0Bb20D4B3e2456B509029662EDbDFba2a09a';
    this.donateAddress    = '0xACF8ef3c3f5536513429629428F8324a5D634b39';

    this.storage = new this.web3.eth.Contract([{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"num","type":"uint256"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"StoreNumber","type":"event"},{"inputs":[],"name":"retrieve","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"num","type":"uint256"}],"name":"store","outputs":[],"stateMutability":"nonpayable","type":"function"}], this.countractAddress);
    this.erc20   = new this.web3.eth.Contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}], Object.keys(this.symbols)[0])
};

EVM.prototype.getBalance = async function() {
    var balance = await this.web3.eth.getBalance(this.from);

    const result = new BigNumber(balance + 'e-' + 18)
        .decimalPlaces(5, BigNumber.ROUND_FLOOR)
        .toString();

    return result;
};

EVM.prototype.getUSDTBalance = async function() {
    var balance = await this.erc20.methods.balanceOf(this.from).call();
    var decimal = await this.erc20.methods.decimals().call()

    const result = new BigNumber(balance + 'e-' + decimal)
        .decimalPlaces(5, BigNumber.ROUND_FLOOR)
        .toString();

    return result;
};

EVM.prototype.amountToValue = function(amount, decimal = 18) {
    const result = new BigNumber(amount + 'e-' + decimal)
        .decimalPlaces(5, BigNumber.ROUND_FLOOR)
        .toString();

    return result;
};

EVM.prototype.tokenAddressToSymbol = function(address) {
    const knownSymbol = this.symbols[address];
    return knownSymbol || 'UNKNOWN'
};

EVM.prototype.transactions = async function(address, page_number = 1, cb) {
    try {
        if (!process.env.REACT_APP_HISTORY_HOST) {
            cb([]);
            return;
        }
        const response = await fetch(`${process.env.REACT_APP_HISTORY_HOST}/transactions/${address}?page_number=${page_number}`);
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

    const balance = await this.getBalance();

    if (balance < (this.donateAmount + this.maxFee)) {
        cb(`No enough VLX for this transaction ${ this.donateAmount + this.maxFee } VLX`, null);
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

    var a = new BN(this.donateAmount);
    var b = new BN(this.decimal.toString());
    const amountBN = this.donateAmount < 1 ? this.donateAmount * this.decimal : a.mul(b);

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

    const balance       = await this.getBalance();
    const balanceUSDT   = await this.getUSDTBalance();

    let gasSponsoring = false;

    if (balance < this.maxFee) {
        //cb(`No enough VLX to pay fee (need ${ this.maxFee } VLX).`, null);
        //return;
        gasSponsoring = true;
    };

    if (balanceUSDT < this.donateAmount) {
        cb(`No enough USDT for this transaction (need ${ balanceUSDT } USDT).`, null);
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
        nonce:     this.nonce,
        from:      this.from,
        gas:       this.web3.utils.toHex(this.gas),
        gasPrice:  this.web3.utils.toHex(this.gasPrice),
        gasSponsoring,
        broadcast: true,
        csrf_token,
    };

    const decimal = await this.erc20.methods.decimals().call()
    const amount  = new BigNumber(this.donateAmount * ('1e' + decimal)).toString();

    this.erc20.methods.transfer(this.donateAddress, String(amount)).send(raw)
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
