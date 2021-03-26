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

    console.log("start create");

    try {

        const fromPubkey = this.getAccountPublickKey();
        const authorized = new Authorized(fromPubkey, fromPubkey);
        const lamports   = 1000000000;
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

        console.log(transaction);

        const { blockhash: recentBlockhash } = await this.connection.getRecentBlockhash();

        transaction.recentBlockhash = recentBlockhash;
        transaction.feePayer = fromPubkey;

        console.log("send");
        
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




Staking.prototype.getStakingAccounts = async function(base58PublicKey) {
    const programId = StakeProgram.programId;
    const accounts = await this.connection.getParsedProgramAccounts(programId);
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