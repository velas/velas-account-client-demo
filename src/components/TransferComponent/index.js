import React, { Component } from 'react';
import { Spin, Button, message, List, Avatar } from 'antd';
import { LoadingOutlined, CodeSandboxOutlined } from '@ant-design/icons';

import ErrorComponent from '../../components/Error';

import Staking  from '../../functions/staking';
import { web3 }  from '../../functions/auth';

import './style.css';

const { VelasAccountProgram, Connection, PublicKey } = web3;

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class TransferComponent extends Component {

    state = {
        error:      false,
        userinfo:   'loading',
        connection: false,
        loading:    false,
        amount:     10000000,
    };

    checkBalance = async function(account, session, lamports) {
        const { feeCalculator: { lamportsPerSignature } } = await this.state.connection.getRecentBlockhash();
    
        const accountBalance = await this.state.connection.getBalance(account);
        const sessionBalance = await this.state.connection.getBalance(session);
    
        if (accountBalance < lamports)             throw new Error(`Account has no funds for the transaction. Need ${ Math.round((lamports / 1000000000) * 100) / 100} VLX`);
        if (sessionBalance < lamportsPerSignature) throw new Error(`No funds to pay for transaction fee on ${session.toBase58()}. You need at least ${ Math.round((lamportsPerSignature / 1000000000) * 100) / 100} VLX per transaction)`);
    };

    transaction = async (toAddress) => {
        const { authorization, client } = this.props;

        this.setState({ loading: true });

        try {
            const fromPubkey  = new PublicKey(authorization.access_token_payload.sub);
            const session_key = new PublicKey(authorization.access_token_payload.ses);
            const to = new PublicKey(toAddress);

            const storage = await VelasAccountProgram.findStorageAddress({
                connection:       this.state.connection,
                accountPublicKey: fromPubkey,
            });

            const transaction = VelasAccountProgram.transfer({
                storage,
                fromPubkey,
                to,
                lamports:    this.state.amount,
                session_key,
            });

            const { blockhash } = await this.state.connection.getRecentBlockhash();

            transaction.recentBlockhash = blockhash;
            transaction.feePayer        = session_key;

            await this.checkBalance(fromPubkey, session_key, this.state.amount);
    
            client.sendTransaction( authorization.access_token, { transaction: transaction.serializeMessage() }, (err, result) => {
                if (err) {
                    message.error(err.description ,5);
                    this.setState({loading: false });
                } else {
                    message.success(result.signature, 8);
                    this.setState({ loading: false });
                    this.balances();
                };
            });

        } catch(e) {
            message.error(e.message, 5)
            this.setState({ loading: false });
        };
    };

    userinfo = async () => {
        const { authorization, client, logout } = this.props;

        return new Promise((resolve) => {
            client.userinfo(authorization.access_token, (err, result) => {
                if (err) {
                    if (err.error === 'failed_authorization' && err.description === 'Invalid access_token') {
                        message.info('Session expired');
                        logout();
                        return;
                    }
                    resolve(err);
                } else {
                    resolve(result);
                };
            });
        });
    };
    
    balances = async () => {
        const { validators } = this.state;

        const accountPubkey  = new PublicKey(this.props.authorization.access_token_payload.sub);
        const accountBalance =  await this.state.connection.getBalance(accountPubkey);

        const ui = this.state.userinfo;
              ui.balance = accountBalance;

        this.setState({ 
            userinfo: ui,
        })

        for (var i in validators) {
            const pubkey  = new PublicKey(validators[i].votePubkey);
            const balance =  await this.state.connection.getBalance(pubkey);
            validators[i].balance = `${Math.round((balance / 1000000000) * 100) / 100} VLX`;
            this.setState({ validators });
        };
    };

    update = async () => {
        this.setState({ 
            userinfo: 'loading',
            validators: 'loading',
        });

        try {
            const { userinfo, error, description } = await this.userinfo();
            console.log("userinfo", userinfo);
 
            if ( error ) throw new Error(description);

            const { validators, desription: staking_description } = await this.state.staking.getInfo();
            if ( staking_description ) throw new Error(staking_description);
            console.log(validators);
            this.setState({ validators, userinfo }, ()=> {
                this.balances();
            });
        } catch(e) {
            this.setState({ error: e.message });
        };
    };

    async componentDidMount() {
        try {
            const { client, authorization } = this.props;
            this.setState({ 
                staking: new Staking({ client, authorization }),
                connection: new Connection(process.env.REACT_APP_NODE_HOST, 'singleGossip'),
            }, ()=> {
                this.update();
            });
        } catch(e) {
            this.setState({ error: e.message });
        };
    };

    render() {
        const { error, userinfo } = this.state;

        return(
            <div className="transfer-component">
                {  error &&                           <ErrorComponent error={error} /> }
                { !error && userinfo === 'loading' && <Spin indicator={antIcon} /> }
                { !error && userinfo !== 'loading' && <div>
                    <h1>Welcome!</h1>
                    <h3><b>{ userinfo.account_key }</b></h3>
                    <p>Your balance: <br/><b>{ Math.round((userinfo.balance / 1000000000) * 100) / 100} VLX</b></p>
                    <br/>
                    <h3><b>Donate</b> your tokens:</h3>
                    <br/>
                    <List
                        className="demo-loadmore-list"
                        itemLayout="horizontal"
                        dataSource={this.state.validators || []}
                        renderItem={item => (
                            <List.Item actions={[<Button onClick={()=>{this.transaction(item.votePubkey)}} type="primary">Donate</Button>]}>
                                <List.Item.Meta 
                                    avatar={ <Avatar style={{color: '#ffffff', background: '#3393e2'}} icon={<CodeSandboxOutlined />} /> }
                                    title={<a href={`https://native.velas.com/address/${item.votePubkey}?cluster=testnet`}>{item.votePubkey}</a>}
                                    description={`Node Public Key: ${item.nodePubkey}.`}
                                />
                                <div>{item.balance}</div>
                            </List.Item>
                        )}
                    />
                </div> }
            </div>
        );
    };
};

export default TransferComponent;