import React, { Component } from "react";
import ReactJson from 'react-json-view';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { Login } from '../';
import { client_redirect_mode, client_popup_mode, client_direct_mode, agent }  from '../../functions/auth';
import Error     from '../../components/Error';

import './index.css';

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class Demo extends Component {

    state = {
        interaction: false,
        account: false,
        loading: true,
        error: false,
    };

    responseHandle = (response) => {
        if (response.redirect) {
            client_direct_mode.parseHash((err, authResult) => {
                if (authResult && authResult.access_token_payload) {
                    this.setState({ account: authResult, loading: false });
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
                login: "0x61Cab20F95b0054e2dbEe43eaF2BcF5D1BbA53b4",
                consent: { rejectedScopes: []},
                merge: true,
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

    redirect_login = () => client_redirect_mode.authorize();

    popup_login = () => client_popup_mode.authorize({}, (err, authResult) => {

        if (authResult && authResult.access_token_payload) {
            this.setState({ account: authResult, loading: false });
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
                this.setState({ account: authResult, loading: false });
            } else if (err) {
                this.setState({ error: err.description, loading: false });
            } else {
                this.setState({ loading: false });
            }

            window.history.replaceState('', '', window.location.href.split('?')[0]);
        });
    };

    render() {
        const { error, loading, account, interaction } = this.state;
        return (
            <div className="demo">
                { error && <Error error={error} /> }
                { !error && loading && <Spin indicator={antIcon} /> }
                { !error && !loading && !account && !interaction &&
                    <div>
                        <Login mode='Popup'    login={this.popup_login}/>
                        <Login mode='Redirect' login={this.redirect_login}/>
                        <Login mode='Direct'   login={this.direct_login}/>
                    </div>
                }
                { !error && !loading && account &&
                    <div>
                        <h2>Success login</h2>
                        <ReactJson  displayObjectSize={false} displayDataTypes={false} theme='railscasts' src={account} />
                    </div>
                }

                { !error && !loading && interaction && !account &&
                    <div>
                        <h2>Interaction details</h2>
                        <ReactJson  displayObjectSize={false} displayDataTypes={false} theme='railscasts' src={interaction} />
                        <Login mode='Interaction' login={this.direct_login_store_key}/>
                    </div>
                }
            </div>
        )
    };
};

export default Demo