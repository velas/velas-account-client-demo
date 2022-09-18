import * as Web3               from '@velas/web3';

const { Connection, PublicKey, LAMPORTS_PER_SOL } = Web3;

function NATIVE(account, session) {
    this.connection    = new Connection(process.env.REACT_APP_NETWORK_HOST, 'singleGossip');
    this.accountPubKey = new PublicKey(account);
    this.sessionPubKey = new PublicKey(session);
};

NATIVE.prototype.getAccountBalance = async function() {
    let balance = await this.connection.getBalance(this.accountPubKey);
    return balance / LAMPORTS_PER_SOL;
};

NATIVE.prototype.getSessionBalance = async function() {
    let balance = await this.connection.getBalance(this.sessionPubKey);
    return balance / LAMPORTS_PER_SOL;
};

export default NATIVE;