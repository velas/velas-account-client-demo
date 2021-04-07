import { Connection, StakeProgram, Authorized, PublicKey, Lockup } from 'velas-solana-web3';

function Staking(options) {

    // validate options.authorization;

    this.client        = options.client;
    this.authorization = options.authorization;
    this.connection    = new Connection(process.env.REACT_APP_NODE_HOST, 'singleGossip');

    this.sol           = 1000000000;
    this.min_stake     = 10000;
    this.max_epoch     = '18446744073709551615';

    this.accounts   = [];
    this.validators = [];
};

Staking.prototype.getAccountPublickKey = function() {
    return new PublicKey(this.authorization.access_token_payload.ses) // operational_key for test
};

Staking.prototype.getStakeActivation = async function(address) {
    try {
        const publicKey  = new PublicKey(address);
        const activation = await this.connection.getStakeActivation(publicKey);


        activation.state    =  activation.state.charAt(0).toUpperCase() + activation.state.slice(1);
        activation.state    =  activation.state === "Inactive" ? "Not delegated" : activation.state;
        activation.state    =  activation.state === "Active"   ? "Delegated"     : activation.state;

        activation.active   = `${ Math.round((activation.active / this.sol) * 100) / 100} SOL`;
        activation.inactive = `${ Math.round((activation.inactive / this.sol) * 100) / 100} SOL`;

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
        validators[i].stake = `${ Math.round((validators[i].activatedStake / this.sol) * 100) / 100} SOL`;
    };

    return validators;
};

Staking.prototype.withdraw = async function(account, amount = 10000002282880) {

    let transaction;

    try {
        const authorizedPubkey = this.getAccountPublickKey();
        const stakePubkey = new PublicKey(account);

        transaction = StakeProgram.withdraw({
            authorizedPubkey,
            stakePubkey,
            lamports: amount,
            toPubkey: authorizedPubkey,
        });
    } catch(e) {
        return {
            error: "prepare_transaction_error",
            description: e.message,
        };
    };

    return this.sendTransaction(transaction);
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

Staking.prototype.createAccount = async function(amount_sol = (this.min_stake * this.sol)) {

    // check balance and amount

    let transaction;

    try {
        const rent       = await this.connection.getMinimumBalanceForRentExemption(200);
        const fromPubkey = this.getAccountPublickKey();
        const authorized = new Authorized(fromPubkey, fromPubkey);
        const lamports   = amount_sol + rent;
        const seed       = await this.getNextSeed();

        const stakeAccountWithSeed = await PublicKey.createWithSeed(
            fromPubkey,
            seed,
            StakeProgram.programId,
        );

        const lockup = new Lockup(0,0, fromPubkey);

        transaction = StakeProgram.createAccountWithSeed({
            authorized,
            basePubkey: fromPubkey,
            fromPubkey,
            lamports,
            lockup,
            seed,
            stakePubkey: stakeAccountWithSeed,
        });
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
        accounts[i].balance = rent ? `${(Math.round((accounts[i].account.lamports - rent) / this.sol) * 100) / 100 } SOL` : `-`;
        accounts[i].rent    = rent ? `${ Math.round((rent / this.sol) * 100) / 100 } SOL` : `-`;
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
        const feePayer      = this.getAccountPublickKey();
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