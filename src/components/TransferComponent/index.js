import React, { Component } from 'react';
import { Spin, Button, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ReactJson from 'react-json-view';

import ErrorComponent from '../../components/Error';

import { web3 }  from '../../functions/auth';

import './style.css';

const { VelasAccountProgram, Connection, PublicKey } = web3;

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class TransferComponent extends Component {

    state = {
        error:    false,
        userinfo:   'loading',
        connection: false,
    };

    checkBalance = async function(account, session, lamports) {
        const { feeCalculator: { lamportsPerSignature } } = await this.state.connection.getRecentBlockhash();
    
        const accountBalance = await this.state.connection.getBalance(account);
        const sessionBalance = await this.state.connection.getBalance(session);
    
        if (accountBalance < lamports)             throw new Error(`Account has no funds for the transaction. Need ${ Math.round((lamports / this.sol) * 10000000) / 10000000} SOL`);
        if (sessionBalance < lamportsPerSignature) throw new Error(`No funds to pay for transaction fee on ${session.toBase58()}. You need at least ${ Math.round((lamportsPerSignature / this.sol) * 10000000) / 10000000} SOL per transaction)`);
    };

    update = async () => {
        this.setState({ userinfo: 'loading' });

        try {
            const { userinfo, error, description } = await this.userinfo();

            console.log("userinfo",userinfo);
 
            if ( error ) throw new Error(description);
            this.setState({ userinfo });
        } catch(e) {
            this.setState({ error: e.message });
        };
    };

    transaction = async () => {
        const { authorization, client } = this.props;

        this.setState({ loading: true });

        try {
            const fromPubkey  = new PublicKey(authorization.access_token_payload.sub);
            const session_key = new PublicKey(authorization.access_token_payload.ses);

            const storage = await VelasAccountProgram.findStorageAddress({
                connection:       this.state.connection,
                accountPublicKey: fromPubkey,
            });

            const transaction = VelasAccountProgram.transfer({
                storage,
                fromPubkey,
                to:          session_key,
                lamports:    1000000000,
                session_key,
            });

            const { blockhash } = await this.state.connection.getRecentBlockhash();

            transaction.recentBlockhash = blockhash;
            transaction.feePayer        = session_key;

            await this.checkBalance(fromPubkey, session_key, 1000000000);
    
            client.sendTransaction( authorization.access_token, { transaction: transaction.serializeMessage() }, (err, result) => {
                if (err) {
                    if (err.error === 'missing_scopes') {
                        this.setState({ error: `Missing scopes: ${err.description}`, loading: false });
                    } else {
                        this.setState({ error: err.description, loading: false });
                    }
                } else {
                    message.success(result.signature, 8);
                    this.setState({ loading: false });
                };
            });

        } catch(e) {
            message.error(e.message, 5)
            this.setState({ loading: false });
        };
    };

    userinfo = async function() {
        const { authorization, client } = this.props;
        return new Promise((resolve) => {
            client.userinfo(authorization.access_token, (err, result) => {
                if (err) {
                    resolve(err);
                } else {
                    resolve(result);
                };
            });
        });
    };

    async componentDidMount() {
        this.setState({
            connection: new Connection(process.env.REACT_APP_NODE_HOST, 'singleGossip'),
        }, ()=> {
            this.update();
        } );
    };

    render() {
        const { error, userinfo, loading } = this.state;
        const scopes = this.props.authorization.access_token_payload.scopes || [];

        return(
            <div className="staking-component">
                {  error &&                           <ErrorComponent error={error} /> }
                { !error && userinfo === 'loading' && <Spin indicator={antIcon} /> }

                { !error && userinfo !== 'loading' && <div>
                    <h3><b>Success login!</b></h3>
                    <h2>Account:</h2>
                    <p><b>Account address</b>: { userinfo.account_key }</p>
                    <p><b>Account balance</b>: <b>{ Math.round((userinfo.balance / 1000000000) * 100) / 100} SOL</b> ({ userinfo.balance })</p>
                    <h2>Session:</h2>
                    <p><b>Session address</b>: { userinfo.session.operational_key}</p>
                    <p><b>Session key balacnce</b>: <b>{ Math.round((userinfo.session.balance / 1000000000) * 100) / 100} SOL</b> ({ userinfo.session.balance})</p>
                    <h2>Scopes:</h2>
                    <ReactJson  displayObjectSize={false} displayDataTypes={false} theme='railscasts' src={scopes} />
                    <br/>
                    <br/>
                    <h2>Transfer Transaction:</h2>
                    <ReactJson  displayObjectSize={false} displayDataTypes={false} theme='railscasts' src={
                        {
                            from:     this.props.authorization.access_token_payload.sub,
                            to:       this.props.authorization.access_token_payload.ses,
                            lamports: 1000000000,
                        }
                    } />
                    <br/>
                    <Button onClick={this.transaction}           loading={loading} disabled={loading} type="primary"  size={'large'}>Transaction</Button>
                    <Button onClick={this.update} loading={loading} disabled={loading} type="primary"  size={'large'}>Update userinfo</Button>

                </div> }
            </div>
        );
    };
};

export default TransferComponent;