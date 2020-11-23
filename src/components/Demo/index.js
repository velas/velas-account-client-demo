import React, { Component } from "react";

import { Login } from '../';
import { auth } from '../../functions/auth';

import './index.css';

class Demo extends Component {

    login = () => auth.authorize();

    componentDidMount() {
        //console.log(auth.client.userInfo());
    };

    render() {
        return (
            <div className="demo">
                <Login login={this.login}/>
            </div>
        )
    };

};

export default Demo