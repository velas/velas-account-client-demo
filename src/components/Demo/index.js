import React, { Component } from "react";
import ReactJson from 'react-json-view';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { Login } from '../';
import { auth }  from '../../functions/auth';
import Error     from '../../components/Error';

import './index.css';

const antIcon = <LoadingOutlined style={{ fontSize: 24, color: '#000000', }} spin />;

class Demo extends Component {

    state = {
        account: false,
        loading: true,
        error: false,
    };

    login = () => auth.authorize();

    componentDidMount() {
        auth.parseHash((err, authResult) => {
            if (authResult && authResult.access_token_payload) {
                this.setState({
                    account: authResult,
                    loading: false,
                });
            } else if (err) {
                const { errorDescription: error } = err;
                this.setState({ error, loading: false });
            } else {
                this.setState({ loading: false });
            }
            window.location.hash = '';
        });
    };

    render() {
        const { error, loading, account } = this.state;
        return (
            <div className="demo">
                { error && <Error error={error} /> }
                { !error && loading && <Spin indicator={antIcon} /> }
                { !error && !loading && !account && <Login login={this.login}/>}
                { !error && account &&
                    <div>
                        <h2>Success login</h2>
                        <ReactJson  displayObjectSize={false} displayDataTypes={false} theme='railscasts' src={account} />
                    </div>
                }
            </div>
        )
    };

};

export default Demo