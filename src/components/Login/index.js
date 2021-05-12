import React, { Component } from "react";
import { Button } from 'antd';

import './index.css';

class Login extends Component {
    render() {
        const {login} = this.props;
        return (
            <div className="login-section">
                <p>To start <b>just click</b> on the button:</p><br/>
                <Button onClick={login} className="login-button" type="primary"  size={'large'}>
                    Try
                </Button>
            </div>
        );
    };
};

export default Login;
