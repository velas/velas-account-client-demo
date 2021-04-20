
import React, { Component } from "react";
import ReactJson from 'react-json-view';
import { Spin, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { Login } from '../';
import { client_redirect_mode, client_popup_mode, client_direct_mode, agent }  from '../../functions/auth';

import Error from '../../components/Error';
import StakingComponent from '../../components/StakingComponent';
import TransferComponent from '../../components/TransferComponent';

import './index.css';

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

const CheckboxGroup = Checkbox.Group;

const plainOptions = [
    'openid',
    'VAcccHVjpknkW5N5R9sfRppQxYJrJYVV7QJGKchkQj5:11',
];

class Demo extends Component {

    state = {
        interaction: false,
        authorization: false,
        loading: true,
        error: false,
        scope: [],
        transfer: true,
    };

    responseHandle = (response) => {
        if (response.redirect) {
            client_direct_mode.parseHash((err, authResult) => {
                if (authResult && authResult.access_token_payload) {
                    this.setState({ authorization: authResult, loading: false });
                } else if (err) {
                    this.setState({ error: err.description, loading: false });
                } else {
                    this.setState({ loading: false });
                }
            }, `?code=${response.redirect.code}&state=${response.redirect.state}`);

        } else {
            this.setState({error: 'something went wrong', loading: false});
        }
    };

    direct_login_store_key = async () => {
        this.setState({loading: true});
        const login_data = !this.state.interaction.sessions.length
            ? {
                mergeWithLastSubmission: false,
                // login: "9HpUb8bCUyUVZVmVRzceS5Bcp2daFbTQJYbX2Tr887Mw",
                // consent: { rejectedScopes: []},
                // merge: true,
            }
            : {
                mergeWithLastSubmission: false,
                select_account: this.state.interaction.sessions[0],
            }

        agent.finishInteraction(this.state.interaction.id, login_data)
        .then( (r) => this.responseHandle(r))
        .catch((e) => {console.log(e)})
    }

    direct_login = () => client_direct_mode.authorize({}, (err, authResult) => {
        if (authResult && authResult.interaction) {
            this.setState({ interaction: authResult.interaction, loading: false });
        } else if (err) {
            this.setState({ error: err.description, loading: false });
        } else {
            this.setState({ loading: false });
        };
    });

    redirect_login = () => client_redirect_mode.authorize({ scope: this.state.scope.join(' ') });

    popup_login = () => client_popup_mode.authorize({}, (err, authResult) => {

        if (authResult && authResult.access_token_payload) {
            this.setState({ authorization: authResult, loading: false });
        } else if (err) {
            this.setState({ error: err.description, loading: false });
        } else {
            this.setState({ loading: false });
        };

        window.history.replaceState('', '', window.location.href.split('?')[0]);
    });

    componentDidMount() {
        client_redirect_mode.parseHash((err, authResult) => {
            if (authResult && authResult.access_token_payload) {
                this.setState({ authorization: authResult, loading: false });
            } else if (err) {
                this.setState({ error: err.description, loading: false });
            } else {
                this.setState({ loading: false });
            }

            window.history.replaceState('', '', window.location.href.split('?')[0]);
        });
    };

    onChange = (scope) => this.setState({scope});

    render() {
        const { error, loading, authorization, interaction, scope, transfer } = this.state;
        return (
            <div className="demo">
                {  error && <Error error={error} /> }
                { !error && loading && <Spin indicator={antIcon} /> }
                { !error && !loading && !authorization && !interaction && <div>
                    <h1>Try a demo</h1>
                    <h3>See how <b>Velas Account</b> works and helps you improve the safety of your customers with a seamless experience</h3>
                    <p><b>Login with scopes:</b></p>
                    <CheckboxGroup options={plainOptions} value={scope} onChange={this.onChange} />
                    <Login mode='Redirect' login={this.redirect_login}/>
                </div> }

                { !error && !loading && authorization && <div>
                    { transfer 
                        ? <TransferComponent authorization={authorization} client={client_redirect_mode}/>
                        : <StakingComponent  authorization={authorization} client={client_redirect_mode}/>
                    }
                </div> }

                { !error && !loading && interaction && !authorization && <div>
                    <h2>Interaction details</h2>
                    <ReactJson  displayObjectSize={false} displayDataTypes={false} theme='railscasts' src={interaction} />
                    <Login mode='Interaction' login={this.direct_login_store_key}/>
                </div> }
            </div>
        )
    };
};

export default Demo