import React, { Component } from "react";
import { Button } from 'antd';

import './index.css';

class Login extends Component {
    render() {
        const {login} = this.props;
        return (
            <div className="login-section">
                <p>To start login flow just click on the button:</p>
                <Button onClick={login} className="login-button" type="primary"  size={'large'}>
                    Log in
                </Button>
            </div>
        );
    };
};

export default Login;
