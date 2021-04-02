import { Connection, StakeProgram, Authorized, PublicKey, Account, Lockup } from 'velas-solana-web3';

function Staking(options) {
    this.client        = options.client;
    this.authorization = options.authorization;
    this.connection    = new Connection(process.env.REACT_APP_NODE_HOST, 'singleGossip');
};

//getStakeActivation

// {
//     "jsonrpc": "2.0",
//     "result": {
//       "active": 124429280,
//       "inactive": 73287840,
//       "state": "activating"
//     },
//     "id": 1
//   }

Staking.prototype.getAccountPublickKey = function() {
    return new PublicKey(this.authorization.access_token_payload.ses) // operational_key for test
}


Staking.prototype.createAccount = async function() {

    try {
        const rent = await this.connection.getMinimumBalanceForRentExemption(200);
        const fromPubkey = this.getAccountPublickKey();
        const authorized = new Authorized(fromPubkey, fromPubkey);
        const lamports   = (10000 * 1000000000) + rent;
        const seed       = '1';

        const stakeAccountWithSeed = await PublicKey.createWithSeed(
            fromPubkey,
            seed,
            StakeProgram.programId,
        );

        const lockup = new Lockup(0,0, fromPubkey);

        const transaction = StakeProgram.createAccountWithSeed({
            authorized,
            basePubkey: fromPubkey,
            fromPubkey,
            lamports,
            lockup,
            seed,
            stakePubkey: stakeAccountWithSeed,
        });

        const data = await this.connection.getRecentBlockhash();

        transaction.recentBlockhash = data.blockhash;
        transaction.feePayer = fromPubkey;
        
        this.client.sendTransaction( this.authorization.access_token, { transaction: transaction.serializeMessage() }, (err, result) => {
            console.log(err, result);
            // if (err) {
            //     message.error({ content: err.description, duration: 5 });
            // } else {
            //     message.success({ content: result.signature, duration: 5 });
            // };
        });

        console.log("after send");

    } catch(_) {
        console.log(_)
    };

    return [];
};


Staking.prototype.checkSeed = async function(base58PublicKey) {
    const fromPubkey = this.getAccountPublickKey();

    for (let i = 0; i < 100; i++) {
        const stakeAccountWithSeed = await PublicKey.createWithSeed(
            fromPubkey,
            i.toString(),
            StakeProgram.programId,
        );

        if (stakeAccountWithSeed.toBase58() === base58PublicKey) return `seed:${i}`;
    };
    return base58PublicKey.slice(0,6);
}

Staking.prototype.getStakingAccounts = async function(base58PublicKey) {
    let programId = StakeProgram.programId;
    let accounts = await this.connection.getParsedProgramAccounts(programId);

    accounts = accounts.filter(item => {
        if (item?.account?.data?.parsed?.info?.meta?.authorized?.staker === base58PublicKey) return true;
        return false;
    });

    for (var i in accounts){
        accounts[i].seed = await this.checkSeed(accounts[i].pubkey.toBase58());
    }

    console.log("getStakingAccounts", accounts);

    return [];
};

Staking.prototype.userinfo = async function() {
    return new Promise((resolve, reject) => {
        this.client.userinfo(this.authorization.access_token, (err, result) => {
            if (err) {
                reject({
                    message: err.description,
                });
            } else {
                resolve(result);
            };
        });
    });
};


export default Staking;