import React, { Component } from "react";
import { Button } from 'antd';

import './index.css';

class Login extends Component {
    render() {
        const {login} = this.props;
        return (
            <div className="login-section">
                <Button onClick={login} className="login-button" type="primary"  size={'large'}>
                    Login with Velas Account
                </Button>
            </div>
        );
    };
};

export default Login;
