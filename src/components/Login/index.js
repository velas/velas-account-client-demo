import React, { Component } from "react";
import { Button } from 'antd';

import './index.css';

const rootUrl = process.env.REACT_APP_AGENT_DOMAIN.includes("localhost") ? 'http://' + process.env.REACT_APP_AGENT_DOMAIN : 'https://' + process.env.REACT_APP_AGENT_DOMAIN;

class Login extends Component {

    state = {
        iframe: false,
    }

    async componentDidMount() {

        var _window = window;  
        var iframe  = _window.document.createElement('iframe');

        iframe.src          = rootUrl + '/iframe';
        iframe.className    = "account-iframe-1";
        iframe.style.width  = "5px";
        iframe.style.height = "5px";
        iframe.style.position = "absolute";
        iframe.style.top    = "0";
        iframe.style.right  = "0";
        iframe.style.zIndex = "1000";
        iframe.onload       = () => { console.log("ready account-iframe-1") };
        iframe.sandbox      = "allow-storage-access-by-user-activation allow-scripts allow-same-origin";
        _window.document.body.appendChild(iframe);

        this.setState({
            iframe: iframe,
        })

        const that = this;

        setTimeout(that.message, 10000);
    };

    message = () => {
        console.log("send post message");
        this.state.iframe.contentWindow.postMessage({
            state: 1,
            test: 'test',
        }, rootUrl)
    }

    render() {
        const {login} = this.props;
        return (
            <div className="login-section">
                <p>To start <b>just click</b> on the button:</p><br/>
                <Button onClick={login} className="login-button" type="primary"  size={'large'}>
                    Try
                </Button>
                <Button onClick={this.message} className="login-button" type="primary"  size={'large'}>
                    Test
                </Button>
            </div>
        );
    };
};

export default Login;
