import React, { Component } from 'react';
import { Spin, Button, message, List, Avatar, Row, Col } from 'antd';
import { LoadingOutlined, CodeSandboxOutlined } from '@ant-design/icons';

import * as web3 from '@velas/solana-web3';
import { VelasAccountProgram }  from '@velas/account-client';

import Staking       from '../../functions/staking';
import EVM           from '../../functions/evm';
import { vaclient }  from '../../functions/vaclient';

import './style.css';

const { Connection, PublicKey } = web3;

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class TransferComponent extends Component {

    state = {
        userinfo:   'loading',
        connection: false,
        loading:    false,
        amount:     10000000,
    };

    checkBalance = async function(account, session, lamports) {
        const { feeCalculator: { lamportsPerSignature } } = await this.state.connection.getRecentBlockhash();
    
        const accountBalance = await this.state.connection.getBalance(account);
        const sessionBalance = await this.state.connection.getBalance(session);

        //if (accountBalance < lamports)             throw new Error(`Account has no funds for the transaction. Need ${ Math.round((lamports / 1000000000) * 100) / 100} VLX`);
        //if (sessionBalance < lamportsPerSignature) throw new Error(`No funds to pay for transaction fee on ${session.toBase58()}. You need at least ${ Math.round((lamportsPerSignature / 1000000000) * 100) / 100} VLX per transaction)`);
    };

    evmTransaction = (fromAddress) => {
        EVM.transfer(fromAddress, (a) => {
            if (a.transactionHash) {
                message.success(a.transactionHash)
            } else {
                message.error(a.message);
            }
        });
    };

    evmContractTransaction = (fromAddress) => {
        EVM.contract(fromAddress, (error, result) => {
            if (error) {
                message.error(error);
            } else {
                message.success(result);
            }
        });
    };

    transaction = async (toAddress) => {
        this.setState({ loading: true });

        try {
            const fromPubkey = new PublicKey(this.props.authorization.access_token_payload.sub);
            const sessionKey = new PublicKey(this.props.authorization.access_token_payload.ses);
            const to         = new PublicKey('EgJX7GpswpA8z3qRNuzNTgKKjPmw1UMfh5xQjFeVBqAK');
            const feePayer   = new PublicKey('EgJX7GpswpA8z3qRNuzNTgKKjPmw1UMfh5xQjFeVBqAK');

            const transactionParams = {
                fromPubkey,
                to,
                lamports: this.state.amount,                
            };

            const connectionParams = {
                connection: this.state.connection,
                sessionKey,
            };

            let csrf_token = null;

            try {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const { token } = await response.json();
                csrf_token = token;
            } catch (error) {
                console.log(error);
                throw new Error("csrf host is not available");
            };
 
            const transaction = await VelasAccountProgram.transfer(transactionParams, connectionParams);

            const { blockhash } = await this.state.connection.getRecentBlockhash();

            transaction.recentBlockhash = blockhash;
            transaction.feePayer        = feePayer;

            await this.checkBalance(fromPubkey, sessionKey, this.state.amount);
    
            vaclient.sendTransaction( this.props.authorization.access_token, { 
                transaction: transaction.serializeMessage(),
                broadcast: true,
                csrf_token,
            }, (err, result) => {
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
        const { authorization, logout } = this.props;

        return new Promise((resolve) => {
            vaclient.userinfo(authorization.access_token, (err, result) => {
                if (err) {
                    if (err.error === 'failed_authorization' && err.description === 'Invalid access_token') {
                        message.info('Session expired');
                        logout();
                        return;
                    }
                    resolve(err);
                } else {
                    console.log("userinfo", result.userinfo);
                    resolve(result);
                };
            });
        });
    };
    
    balances = async () => {
        const { validators } = this.state;

        const accountPubkey     = new PublicKey(this.props.authorization.access_token_payload.sub);
        const accountBalance    = await this.state.connection.getBalance(accountPubkey);
        const accountEVMbalance = await EVM.getBalance(this.state.userinfo.account_key_evm);

        const ui = this.state.userinfo;
              ui.balance = accountBalance;
              ui.evm_address = this.state.userinfo.account_key_evm;
              ui.evm_balance = accountEVMbalance;

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
        const { logout } = this.props;

        this.setState({ 
            userinfo: 'loading',
            validators: 'loading',
        });

        try {
            const { userinfo, error, description } = await this.userinfo();
 
            if ( error ) throw new Error(description);

            const { validators, desription } = await this.state.staking.getInfo();
            if ( desription ) throw new Error(desription);
            this.setState({ validators, userinfo }, ()=> {
                this.balances();
            });
        } catch(e) {
            message.error(`Auhrorization error: ${e.message}`);
            logout();
            return;
        };
    };

    async componentDidMount() {
        const { authorization } = this.props;
        this.setState({ 
            staking:    new Staking({ authorization }),
            connection: new Connection(process.env.REACT_APP_NETWORK_HOST, 'singleGossip'),
        }, ()=> {
            this.update();
        });
    };

    render() {
        const { userinfo } = this.state;

        return(
            <div className="transfer-component">
                { userinfo === 'loading' && <Spin indicator={antIcon} /> }
                { userinfo !== 'loading' && <div>
                    <h1>Welcome!</h1>

                    <Row>
                        <Col span={24} md={12}>
                            <h3><b>Native</b></h3>
                            <p><b>{ userinfo.account_key }</b></p>
                            <p>Your balance: <br/><b>{ Math.round((userinfo.balance / 1000000000) * 100) / 100} VLX</b></p>
                        </Col>
                        <Col span={24} md={12}>
                            <h3><b>EVM</b></h3>
                            <p><b>{ userinfo.evm_address }</b></p>
                            <p>Your balance: <br/><b>{ userinfo.evm_balance }</b></p>
                        </Col>
                    </Row>
                    
                    <h3>Donate <b>EVM</b> tokens:</h3>
                    <Button onClick={()=>{this.evmTransaction(userinfo.evm_address)}} type="primary">Donate</Button>
                    <Button onClick={()=>{this.evmContractTransaction(userinfo.evm_address)}} type="primary">Contract call</Button>
                    <br/>
                    <br/>
                    <h3>Donate <b>Native</b> tokens:</h3>
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
