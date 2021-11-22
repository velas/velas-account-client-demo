import * as web3 from '@velas/solana-web3';
import { VelasAccountProgram }  from '@velas/account-client';

const { Connection, StakeProgram, Authorized, PublicKey, Lockup } = web3;

function Staking(options) {

    // validate options.authorization;

    this.client        = options.client;
    this.authorization = options.authorization;
    this.connection    = new Connection(process.env.REACT_APP_NETWORK_HOST, 'singleGossip');

    this.sol           = 1000000000;
    this.min_stake     = 10000;
    this.max_epoch     = '18446744073709551615';

    this.accounts   = [];
    this.validators = [];
};

Staking.prototype.getAccountPublickKey = function() {
    return new PublicKey(this.authorization.access_token_payload.sub)
};

Staking.prototype.getSessionPublickKey = function() {
    return new PublicKey(this.authorization.access_token_payload.ses)
};

Staking.prototype.getStakeActivation = async function(address) {
    try {
        const publicKey  = new PublicKey(address);
        const activation = await this.connection.getStakeActivation(publicKey);


        activation.state    =  activation.state.charAt(0).toUpperCase() + activation.state.slice(1);
        activation.state    =  activation.state === "Inactive" ? "Not delegated" : activation.state;
        activation.state    =  activation.state === "Active"   ? "Delegated"     : activation.state;

        activation.active   = `${ Math.round((activation.active / this.sol) * 100) / 100} VLX`;
        activation.inactive = `${ Math.round((activation.inactive / this.sol) * 100) / 100} VLX`;

        return activation;
    } catch(_) {
        return undefined;
    };
};

Staking.prototype.getStakingValidators = async function() {
    const voteAccounts = await this.connection.getVoteAccounts();

    const validators = voteAccounts.current.concat(voteAccounts.delinquent);

    for (var i in validators) {
        validators[i].key   = validators[i].votePubkey;
        validators[i].stake = `${ Math.round((validators[i].activatedStake / this.sol) * 100) / 100} VLX`;
    };

    return validators;
};

Staking.prototype.undelegate = async function(account) {

    let transaction;

    try {
        const authorizedPubkey = this.getAccountPublickKey();
        const stakePubkey      = new PublicKey(account);
    
        transaction = StakeProgram.deactivate({
            authorizedPubkey,
            stakePubkey,
        });
    } catch(e) {
        return {
            error: "prepare_transaction_error",
            description: e.message,
        };
    };

    return this.sendTransaction(transaction);
};

Staking.prototype.delegate = async function(account, validator) {

    let transaction;

    try {
        const authorizedPubkey = this.getAccountPublickKey();
        const stakePubkey = new PublicKey(account);
        const votePubkey = new PublicKey(validator);

        transaction = StakeProgram.delegate({
            authorizedPubkey,
            stakePubkey,
            votePubkey,
        });
    } catch(e) {
        return {
            error: "prepare_transaction_error",
            description: e.message,
        };
    };

    return this.sendTransaction(transaction);
};

Staking.prototype.getNextSeed = async function() {
    const fromPubkey = this.getAccountPublickKey();

    for (let i = 0; i < 1000; i++) {
        const stakeAccountWithSeed = await PublicKey.createWithSeed(
            fromPubkey,
            i.toString(),
            StakeProgram.programId,
        );

        if (this.accounts.filter(item => { return item.address === stakeAccountWithSeed.toBase58()}).length === 0) {
            return i.toString();
        };
    };
};

Staking.prototype.checkBalance = async function(account, session, lamports) {
    const { feeCalculator: { lamportsPerSignature } } = await this.connection.getRecentBlockhash();

    const accountBalance = await this.connection.getBalance(account);
    const sessionBalance = await this.connection.getBalance(session);

    if (accountBalance < lamports)             throw new Error(`Account has no funds for the transaction. Need ${ Math.round((lamports / this.sol) * 10000000) / 10000000} VLX`);
    if (sessionBalance < lamportsPerSignature) throw new Error(`No funds to pay for transaction fee on ${session.toBase58()}. You need at least ${ Math.round((lamportsPerSignature / this.sol) * 10000000) / 10000000} VLX per transaction)`);
};

Staking.prototype.withdraw = async function(stakeAccount, amount = 10000002282880) {

    let transaction;

    try {
        const account = this.getAccountPublickKey();
        const session = this.getSessionPublickKey();
        const storage = await VelasAccountProgram.findStorageAddress({
            accountPublicKey: account,
            connection:       this.connection,
        });

        const withdraw_transaction = StakeProgram.withdraw({
            authorizedPubkey: account,
            stakePubkey:      new PublicKey(stakeAccount),
            lamports:         amount,
            toPubkey:         account,
        });

        console.log("wihdraw", withdraw_transaction);

        const keys = [
            { pubkey: withdraw_transaction.instructions[0].programId, isSigner: false, isWritable: false },
            ...withdraw_transaction.instructions[0].keys,
        ];

        keys[5].isSigner = false;

        transaction = VelasAccountProgram.execute({
            fromPubkey:  account,
            storage, 
            session_key: session,
            keys,
            data: withdraw_transaction.instructions[0].data,
        });

    } catch(e) {
        return {
            error: "prepare_transaction_error",
            description: e.message,
        };
    };

    return this.sendTransaction(transaction);
};

Staking.prototype.createAccount = async function(amount_sol) {

    let transaction;

    try {
        if (typeof amount_sol !== 'number' || amount_sol < this.min_stake) throw new Error(`Minimal stake is ${this.min_stake} VLX.`);

        const rent     = await this.connection.getMinimumBalanceForRentExemption(200);
        const lamports = (amount_sol * this.sol) + rent;

        const account = this.getAccountPublickKey();
        const session = this.getSessionPublickKey();
        const storage = await VelasAccountProgram.findStorageAddress({
            accountPublicKey: account,
            connection:       this.connection,
        });

        const lockup     = new Lockup(0,0, account);
        const authorized = new Authorized(account, account);
    
        const seed                 = await this.getNextSeed();
        const stakeAccountWithSeed = await PublicKey.createWithSeed(account, seed, StakeProgram.programId);

        transaction = VelasAccountProgram.createAccountWithSeed({
            authorized,
            basePubkey:  account,
            fromPubkey:  account,
            lamports,
            lockup,
            seed,
            stakePubkey: stakeAccountWithSeed,
            storage, 
            session_key: session,
        });

        await this.checkBalance(account, session, lamports); // check balance and amount

        // transaction = await VelasAccountProgram.transfer({
        //     fromPubkey,
        //     to: fromPubkey,
        //     op_key,
        //     amount: 1,
        // })

    } catch(e) {
        return {
            error: "prepare_transaction_error",
            description: e.message,
        };
    };

    return this.sendTransaction(transaction);
};

Staking.prototype.checkSeed = async function(base58PublicKey) {
    const fromPubkey = this.getAccountPublickKey();
    for (let i = 0; i < 1000; i++) {
        const stakeAccountWithSeed = await PublicKey.createWithSeed(
            fromPubkey,
            i.toString(),
            StakeProgram.programId,
        );
        if (stakeAccountWithSeed.toBase58() === base58PublicKey) return `stake:${i}`;
    };
    return base58PublicKey.slice(0,6);
};

Staking.prototype.getStakingAccounts = async function(accounts) {
    let owner = this.getAccountPublickKey();

    accounts = accounts.filter(item => {
        if (item?.account?.data?.parsed?.info?.meta?.authorized?.staker === owner.toBase58()) return true;
        return false;
    });

    for (var i in accounts) {
        const rent = accounts[i].account?.data?.parsed?.info?.meta?.rentExemptReserve;
        accounts[i].seed    = await this.checkSeed(accounts[i].pubkey.toBase58());
        accounts[i].address = accounts[i].pubkey.toBase58();
        accounts[i].key     = accounts[i].address;
        accounts[i].balance = rent ? `${(Math.round((accounts[i].account.lamports - rent) / this.sol) * 100) / 100 } VLX` : `-`;
        accounts[i].rent    = rent ? `${ Math.round((rent / this.sol) * 100) / 100 } VLX` : `-`;
        accounts[i].status  = `Not delegated`;
        accounts[i].validator = `-`;

        if (accounts[i].account?.data?.parsed?.info?.stake) {
            const activationEpoch   = Number(accounts[i].account?.data?.parsed?.info?.stake.delegation.activationEpoch);
            const deactivationEpoch = Number(accounts[i].account?.data?.parsed?.info?.stake.delegation.deactivationEpoch);

            if (deactivationEpoch > activationEpoch || activationEpoch === this.max_epoch) {
                accounts[i].status    = `loading`;
                accounts[i].validator = accounts[i].account?.data?.parsed?.info?.stake?.delegation?.voter;
            };
        };
    };

    return accounts;
};

Staking.prototype.getInfo = async function() {
    const accounts = await this.connection.getParsedProgramAccounts(StakeProgram.programId);

    const delegators = {};
    const stakes     = {};

    for (var a in accounts) {
        const voter             =        accounts[a].account?.data?.parsed?.info?.stake?.delegation?.voter
        const activationEpoch   = Number(accounts[a].account?.data?.parsed?.info?.stake?.delegation?.activationEpoch   || 0);
        const deactivationEpoch = Number(accounts[a].account?.data?.parsed?.info?.stake?.delegation?.deactivationEpoch || 0);

        if (voter && (deactivationEpoch > activationEpoch || activationEpoch === this.max_epoch)) {
            delegators[voter] = delegators[voter] ? delegators[voter] + 1 : 1;
        };
    };

    this.accounts   = await this.getStakingAccounts(accounts);
    this.validators = await this.getStakingValidators();

    for (var s in this.accounts) {
        if (this.accounts[s].validator !== '-') {
            if (!stakes[this.accounts[s].validator]) stakes[this.accounts[s].validator] = [];
            
            stakes[this.accounts[s].validator].push({
                key:  this.accounts[s].key,
                seed: this.accounts[s].seed,
            });
        };
    };

    for (var i in this.validators) {
        this.validators[i].delegators = delegators[this.validators[i].votePubkey] || 0;
        this.validators[i].stakes     = stakes[this.validators[i].votePubkey] || []; 
    };

    return {
        accounts: this.accounts,
        validators: this.validators,
    };
};

Staking.prototype.sendTransaction = async function(transaction) {
    try {
        const feePayer      = this.getSessionPublickKey();
        const { blockhash } = await this.connection.getRecentBlockhash();

        transaction.recentBlockhash = blockhash;
        transaction.feePayer        = feePayer;

    } catch(e) {
        return {
            error: "cunstruct_transaction_error",
            description: e.message,
        };
    };

    return new Promise((resolve) => {
        this.client.sendTransaction( this.authorization.access_token, { transaction: transaction.serializeMessage() }, (err, result) => {
            if (err) {
                resolve(err);
            } else {
                resolve(result);
            };
        });
    });
};

Staking.prototype.userinfo = async function() {
    return new Promise((resolve) => {
        this.client.userinfo(this.authorization.access_token, (err, result) => {
            if (err) {
                resolve(err);
            } else {
                resolve(result);
            };
        });
    });
};

export default Staking;