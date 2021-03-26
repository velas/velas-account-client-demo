import React, { Component } from 'react';

import { Spin, message, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Error from '../../components/Error';

import Staking  from '../../functions/staking';

import './style.css'

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class StakingComponent extends Component {

    state = {
        loading:  true,
        error:    false,
        userinfo: false,
        staking:  false,
        staking_accounts: [],
    };

    updateStakingAccounts = async () => {
        try {
            this.setState({ 
                staking_accounts: await this.state.staking.getStakingAccounts(this.state.userinfo.account_key),
            });
        } catch(e) {
            this.setState({
                error: e.message,
                loading: false,
            });
        };
    };

    createAccount = async () => {
        const { staking } = this.state;
        await staking.createAccount();
    };

    async componentDidMount() {
        try {
            const { client, authorization } = this.props;

            const staking = new Staking({client, authorization});

            const { userinfo } = await staking.userinfo();

            console.log("userinfo", userinfo);

            this.setState({
                staking,
                userinfo,
                loading: false,
            }, ()=> {
                this.updateStakingAccounts();
            });
        } catch(e) {
            this.setState({
                error: e.message,
                loading: false,
            });
        };
    };

    render() {
        const { authorization } = this.props;
        const { error, loading, userinfo, staking_accounts } = this.state;

        return(
            <div className="staking-component">
                {  error &&            <Error error={error}       /> }
                { !error && loading && <Spin  indicator={antIcon} /> }

                { !error && !loading && <div>
                    <h2>Account Info:</h2>
                    <p>your address:  { userinfo.account_key }</p>
                    <p>your balacnce: { userinfo.balance }</p>
                    <h2>Your staking accounts:</h2>
                    <p>{staking_accounts}</p>

                    <Button onClick={this.createAccount} type="primary"  size={'large'}>
                        Create Account
                    </Button>

                    <Button onClick={this.updateStakingAccounts} type="primary"  size={'large'}>
                        Update Accounts
                    </Button>
                </div> }


            </div>
        )
    };
};

export default StakingComponent;