
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react'
import { message, Spin } from 'antd';

import {Login} from '../';
import {vaclient} from '../../functions/vaclient';
import {useStores} from '../../store/RootStore'

import Error from '../../components/Error';
import StakingComponent from '../../components/StakingComponent';
import TransferComponent from '../../components/TransferComponent';

import './index.css';

const Demo = observer(() => {
    const {authStore: {setCurrentSession, setError, findActiveSession, session, error, loading, logout}} = useStores();
    const [transfer] = useState(true);

    const processAuthResult = (err, authResult) => {
        if (authResult && authResult.access_token_payload) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setCurrentSession(authResult);
            return;
        } else if (err) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setError(err.description);
            return;
        };
    };

    const checkAuthorization = () => {
        findActiveSession();

        if (session) return;

        vaclient.handleRedirectCallback(processAuthResult);
    };

    const login = () => {
        vaclient.authorize({
            csrfToken: async function () {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const result = await response.json();
                return result.token
            },
            scope: 'authorization VelasAccountProgram:Transfer',
            challenge: 'some_challenge_from_backend'
        }, processAuthResult);
    };

    useEffect(checkAuthorization, []);

    return (
        <div className="demo">
            <div className="hidden-block"></div>

            {error
                ? <Error error={error}/>
                : <>
                    {loading
                        ? <Spin className="loading-spin" size="large"/>
                        : <>
                            {!session
                                ? <div className="try-demo-section">
                                    <h1>Try a demo</h1>
                                    <h3>See how <b>Velas Account</b> works and helps you improve the safety of your customers with a seamless experience</h3>
                                    <Login mode='Redirect' login={login}/>
                                </div>
                                : <>
                                    {transfer
                                        ? <TransferComponent authorization={session} logout={logout}/>
                                        : <StakingComponent authorization={session}/>
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
