
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react'
import { Spin } from 'antd';

import { Login } from '../';
import { client_redirect_mode }  from '../../functions/auth';
import { useStores } from '../../store/RootStore'

import Error from '../../components/Error';
import StakingComponent from '../../components/StakingComponent';
import TransferComponent from '../../components/TransferComponent';

import './index.css';

const Demo = observer(() => {
    const { auth } = useStores();
    const [transfer] = useState(true);

    const checkAuthorization = () => {
        client_redirect_mode.parseHash((err, authResult) => {
            if (authResult && authResult.access_token_payload) {
                auth.login(authResult);
                auth.setLoading(false);
            } else if (err) {
                auth.setError(err.description);
                auth.setLoading(false);
            } else {
                auth.setLoading(false);
            };

            window.history.replaceState('', '', window.location.href.split('?')[0]);
        });
    };

    const login = () => client_redirect_mode.authorize({ scope: 'VAcccHVjpknkW5N5R9sfRppQxYJrJYVV7QJGKchkQj5:11' });

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
                                        ? <TransferComponent authorization={auth.authorization} client={client_redirect_mode}/>
                                        : <StakingComponent  authorization={auth.authorization} client={client_redirect_mode}/>
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
