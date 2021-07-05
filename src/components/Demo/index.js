
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react'
import { Spin } from 'antd';

import { Login } from '../';
import { client, authorizeCallBack }  from '../../functions/auth';
import { useStores } from '../../store/RootStore'

import Error from '../../components/Error';
import StakingComponent from '../../components/StakingComponent';
import TransferComponent from '../../components/TransferComponent';

import './index.css';

const Demo = observer(() => {
    const { auth }   = useStores();
    const [transfer] = useState(true);

    const checkAuthorization = () => {
        client.handleRedirectCallback(authorizeCallBack(auth));
    };

    const login = () => {
        client.authorize({ 
            scope: 'VAcccHVjpknkW5N5R9sfRppQxYJrJYVV7QJGKchkQj5:11 VelasAccountProgram:Execute EVM1111111111111111111111111111111111111111:4'
        }, authorizeCallBack(auth));
    }

    useEffect(checkAuthorization, []);

    return (
        <div className="demo">
            <div className="hidden-block"></div>

            { auth.error 
                ? <Error error={auth.error} />
                : <>
                    { auth.loading 
                        ? <Spin className="loading-spin" size="large" />
                        : <>
                            { !auth.authorization 
                                ? <div className="try-demo-section">
                                    <h1>Try a demo</h1>
                                    <h3>See how <b>Velas Account</b> works and helps you improve the safety of your customers with a seamless experience</h3>
                                    <Login mode='Redirect' login={login}/>
                                </div>
                                :<>
                                    { transfer 
                                        ? <TransferComponent authorization={auth.authorization} client={client} logout={auth.logout}/>
                                        : <StakingComponent  authorization={auth.authorization} client={client}/>
                                    }
                                </>

                            }
                        
                        </>
                    }
                </>
            }
        </div>
    )
});

export default Demo;
