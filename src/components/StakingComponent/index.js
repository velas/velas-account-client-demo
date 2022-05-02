import React, { Component } from 'react';

import { Spin, Button, Table, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import ErrorComponent from '../../components/Error';

import Staking  from '../../functions/staking';

import './style.css'

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class StakingComponent extends Component {

    columns_validators = [
        {
            title: 'Address',
            dataIndex: 'votePubkey',
            key: 'address',
        },
    
        {
            title: 'Stake',
            dataIndex: 'stake',
            key: 'stake',
        },
    
        {
            title: 'Fee',
            dataIndex: 'commission',
            key: 'commission',
        },
    
        {
            title: 'Last Vote',
            dataIndex: 'lastVote',
            key: 'lastVote',
        },
    
        {
            title: 'Delegators',
            dataIndex: 'delegators',
            key: 'delegators',
        },
    
        {
            title: 'Stakes',
            key: 'stakes',
            dataIndex: 'stakes',
            render: (record) => (
                <div>
                    { record.map((item) => {
                      return <Button key={item.key}>{item.seed}</Button>
                    } )}
                </div>
            ),
        },
    ];

    columns_accounts = [
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
        },
    
        {
            title: 'Validator',
            dataIndex: 'validator',
            key: 'validator',
        },
    
        {
            title: 'Seed',
            dataIndex: 'seed',
            key: 'seed',
        },
    
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => record.status === 'loading' 
            ? <Spin  indicator={antIcon} />
            : record.status,
        },
    
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    { record.status === 'Not delegated' && <Button onClick={() => this.handleDelegate(record.address)}>Delegate</Button> }
                    { record.status === 'Activating'    && <Button onClick={() => this.handleUndelegate(record.address)}>Undelegate</Button> }
                    { record.status === 'Delegated'     && <Button onClick={() => this.handleUndelegate(record.address)}>Undelegate</Button> }
                    { record.status === 'Deactivating'  && <Button disabled={true} onClick={() => this.handleDelegate(record.address)}>Delegate</Button> }

                    { record.status === 'Not delegated' && <Button onClick={() => this.handleWithdraw(record.address)}>Withdraw</Button> }
                    { record.status !== 'Not delegated' && <Button disabled={true} onClick={() => this.handleWithdraw(record.address)}>Withdraw</Button> }
                </div>
            ),
        },
    ];

    state = {
        error:    false,
        staking:  false,
        userinfo:   'loading',
        accounts:   'loading',
        validators: 'loading',
    };

    handleWithdraw = async (address) => {

        this.setState({ userinfo: 'loading', accounts: 'loading', validators: 'loading' });
        const { signature, error, description } = await this.state.staking.withdraw(address);

        if (error) {
            message.error(description, 4);
        } else {
            message.success(signature, 4);
        };

        this.updateStakingAccounts();
    };

    handleDelegate = async (address) => {
        this.setState({ userinfo: 'loading', accounts: 'loading', validators: 'loading' });
        const { signature, error, description } = await this.state.staking.delegate(address, 'HzTt8fUhda4xUyv6bruzD5hCaDnwQexsZa1NczNoSEry');

        if (error) {
            message.error(description, 4);
        } else {
            message.success(signature, 4);
        };

        this.updateStakingAccounts();
    };

    handleUndelegate = async (address) => {
        this.setState({ userinfo: 'loading', accounts: 'loading', validators: 'loading' });
        const { signature, error, description } = await this.state.staking.undelegate(address);

        if (error) {
            message.error(description, 4);
        } else {
            message.success(signature, 4);
        };

        this.updateStakingAccounts();
    };

    createAccount = async () => {
        this.setState({ userinfo: 'loading', accounts: 'loading', validators: 'loading' });
        const { signature, error, description } = await this.state.staking.createAccount(10000);

        if (error) {
            message.error(description, 8);
        } else {
            message.success(signature, 8);
        };

        this.updateStakingAccounts();
    };

    updateStakeActivation = async () => {
        const { accounts, staking } = this.state;

        for (var i in accounts) {
            if (accounts[i].status === 'loading') {
                const activation = await staking.getStakeActivation(accounts[i].address);

                if (activation) {
                    accounts[i].status         = activation.state // active, inactive, activating, deactivating
                    accounts[i].inactive_stake = activation.inactive;
                    accounts[i].active_stake   = activation.active;

                    this.setState({ accounts });
                }
            };
        };
    };

    updateStakingAccounts = async () => {
        this.setState({ 
            userinfo:   'loading',
            accounts:   'loading',
            validators: 'loading',
        });

        try {
            const { userinfo, error, description } = await this.state.staking.userinfo();

            console.log("userinfo",userinfo);
 
            if ( error ) throw new Error(description);
            this.setState({ userinfo });

            const { accounts, validators, error: staking_error, desription: staking_description } = await this.state.staking.getInfo();
            if ( staking_error ) throw new Error(staking_description);
            this.setState({ accounts, validators });

            this.updateStakeActivation();
        } catch(e) {
            this.setState({ error: e.message });
        };
    };

    async componentDidMount() {
        try {
            const { client, authorization } = this.props;
            this.setState({ staking: new Staking({ client, authorization }) }, ()=> {
                this.updateStakingAccounts();
            });
        } catch(e) {
            this.setState({ error: e.message });
        };
    };

    render() {
        const { error, userinfo, accounts, validators } = this.state;

        return(
            <div className="staking-component">
                {  error &&                           <ErrorComponent error={error} /> }
                { !error && userinfo === 'loading' && <Spin  indicator={antIcon}    /> }

                { !error && userinfo !== 'loading' && <div>
                    <h2>Account Info:</h2>
                    <p>your address:  { userinfo.account_key }</p>
                    <p>your Account balacnce: <b>{ Math.round((userinfo.balance / 1000000000) * 100) / 100} VLX</b> ({ userinfo.balance })</p>
                    <h2>Session Info:</h2>
                    <p>your session address: { userinfo.session.operational_key}</p>
                    <p>your Session key balacnce: <b>{ Math.round((userinfo.session.balance / 1000000000) * 100) / 100} VLX</b> ({ userinfo.session.balance})</p>

                    { accounts === 'loading' ? <Spin  indicator={antIcon}/> : 
                        <div>
                            <h2>Your staking accounts:</h2>
                            <Button onClick={this.createAccount} type="primary"  size={'large'}>
                                Create Account
                            </Button>

                            <Button onClick={this.updateStakingAccounts} type="primary"  size={'large'}>
                                Update Accounts
                            </Button>

                            <Table columns={this.columns_accounts} dataSource={accounts} />

                            <h2>Validators:</h2>
                            <Table columns={this.columns_validators} dataSource={validators} />
                        </div>
                    }
                </div> }
            </div>
        );
    };
};

export default StakingComponent;