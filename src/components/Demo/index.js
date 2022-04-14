
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react'
import { Spin, Popover } from 'antd';

import {Login} from '../';
import {vaclient, vaclient_2} from '../../functions/vaclient';
import {useStores} from '../../store/RootStore'

import Error from '../../components/Error';
import StakingComponent from '../../components/StakingComponent';
import TransferComponent from '../../components/TransferComponent';

import logo from '../../assets/logo.png'; // with import

import './index.css';

const Demo = observer(() => {
    const {authStore: {setCurrentSession, setError, findActiveSession, session, error, loading, setLoading, logout}} = useStores();
    const [transfer] = useState(true);

    const [count, setCount] = useState(0);

    const processAuthResult = (err, authResult) => {
        if (authResult && authResult.access_token_payload) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setCurrentSession(authResult);
        } else if (err) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setError(err.description);
        };

        setLoading(false);
    };

    const checkAuthorization = () => {        
        findActiveSession();

        if (session) return;
        setLoading(true);
        vaclient.handleRedirectCallback(processAuthResult);
    };

    const login = () => {
        vaclient.authorize({
            csrfToken: async function () {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const result = await response.json();
                return result.token
            },
            scope: 'VelasAccountProgram:Transfer VelasAccountProgram:Execute EVM:Execute',
        }, processAuthResult);
    };

    const login_1 = () => {
        vaclient.authorize({
            csrfToken: async function () {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const result = await response.json();
                return result.token
            },
            scope: 'authorization',
            challenge: 'some_challenge_from_backend'
        }, processAuthResult);
    };
    
    const login_2 = () => {
        vaclient.authorize({
            csrfToken: async function () {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const result = await response.json();
                return result.token
            },
            scope: 'VelasAccountProgram:RemoveOperational VelasAccountProgram:Transfer VelasAccountProgram:Execute EVM:Execute'
        }, processAuthResult);
    };

    const login_3 = () => {
        vaclient.authorize({
            csrfToken: async function () {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const result = await response.json();
                return result.token
            },
            scope: 'VelasAccount:Transfer'
        }, processAuthResult);
    };

    const login_4 = () => {
        vaclient_2.authorize({
            csrfToken: async function () {
                const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                const result = await response.json();
                return result.token
            },

            scope: 'VelasAccountProgram:Transfer'
        }, processAuthResult);
    };

    useEffect(checkAuthorization, []);

    return (
        <div className="demo">
            <div className="hidden-block"></div>

            {error
                ? <Error error={error}/>
                : <>
                    <div className="title-block">
                        <h1>Let's try <b>Velas Account</b> in action</h1>
                        <p>See how <b>Velas Account</b> works and helps you improve the safety <br/> of your customers with a seamless experience</p>
                        { loading && <Spin className="loading-spin" size="large"/> }
                    </div>
                    { !loading && <>
                            {!session
                                ? <div className="try-demo-section">
                                    <img onClick={() => setCount(count + 1)} alt="pc" src={logo} />
                                    <h1>Log in</h1>
                                    <h4>to <b>Demo site</b> to continue:</h4>
                                    <Login mode='Redirect' login={login}/>

                                    { count >= 10 && <>
                                        <p>____<br/><br/></p>

                                        <p>Login to test <Popover content={"'VelasAccountProgram:RemoveOperational VelasAccount:Transfer VelasAccountProgram:Execute EVM:Execute'"} title="scopes:"><b>init account</b></Popover> flow</p>
                                        <Login mode='Redirect' login={login_2}/>

                                        <p>Login to test <Popover content={"'authorization'"} title="scopes:"><b>sign challenge</b></Popover> flow</p>
                                        <Login mode='Redirect' login={login_1}/>

                                        <p>Login to test <Popover content={"'VelasAccount:Transfer'"} title="scopes:"><b>wrong scopes</b></Popover> flow</p>
                                        <Login mode='Redirect' login={login_3}/>

                                        <p>Login to test <Popover content={"'VelasAccountProgram:Transfer'"} title="scopes:"><b>wrong client_id</b></Popover> flow</p>
                                        <Login mode='Redirect' login={login_4}/>
                                    </>}
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
