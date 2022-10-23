import React, { useEffect } from 'react';
import { observer } from 'mobx-react'
import { Layout, Avatar, Button, Menu, Dropdown, Spin, message } from 'antd';
import {UserOutlined, ShoppingCartOutlined, LogoutOutlined, UserSwitchOutlined} from '@ant-design/icons';

import { DemoSection, Background } from './components'
import { useStores } from './store/RootStore'
import { vaclient, vaclient_wrong, vaclient_popup, vaclient_mobile }  from './functions/vaclient';
import {ReactComponent as Error400} from "./assets/error-400.svg";

const { Header, Content } = Layout;

const App = observer(() => {
    const { authStore: { 
        findActiveSession,
        setCurrentSession,
        setError,
        setUserinfo,
        logout,
        session,
        userinfo,
        error,
        loading,
        setLoading
    }} = useStores();

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (session && userinfo) getUserinfo(session.access_token);
        }, 5000);

        if (!session) clearInterval(intervalId);
    
        return () => clearInterval(intervalId);
    }, [session, userinfo]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!!error) setTimeout(()=>{
            setError(false);
            logout();
        }, 6000)
    }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

    const getUserinfo = (access_token) => {
        vaclient.userinfo(access_token, (e, result) => {
            if (e) {
                if (e.error === 'failed_authorization') {
                    message.info(`Session terminated: ${e.description || e}`);
                    logout();
                } else {
                    message.info(`Userinfo error: ${e.description || e}`);
                    logout();
                };
            } else {
                setUserinfo(result.userinfo);
            };

            setLoading(false);
        });
    };
  
    const processAuthResult = (e, authResult) => {
        if (authResult && authResult.access_token_payload) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setCurrentSession(authResult);
            getUserinfo(authResult.access_token);
        } else if (e) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setError(e.description);
        };

        if (!authResult) setLoading(false);
    };

    const checkActiveSession = () => {
        const foundSession = findActiveSession();
        if (foundSession) {
            getUserinfo(foundSession.access_token);
        } else {
            setLoading(true);
            vaclient.handleRedirectCallback(processAuthResult);
        }
    };

    useEffect(checkActiveSession, []);

    const login = {
        default: () => {
            vaclient.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
                scope: 'VelasAccountProgram:Transfer VelasAccountProgram:Execute EVM:Execute VelasAccountProgram:SponsorAndExecute'
            }, processAuthResult);
        },

        login_popup: () => {
            vaclient_popup.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
                scope: 'VelasAccountProgram:Transfer VelasAccountProgram:Execute EVM:Execute VelasAccountProgram:SponsorAndExecute'
            }, processAuthResult);
        },

        login_1: () => {
            vaclient.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
                scope: 'authorization',
                challenge: 'some_challenge_from_backend'
            }, processAuthResult);
        },

        login_2: () => {
            vaclient.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
                scope: 'VelasAccountProgram:LockOperational VelasAccountProgram:Transfer VelasAccountProgram:Execute EVM:Execute VelasAccountProgram:SponsorAndExecute'
            }, processAuthResult);
        },

        login_3: () => {
            vaclient.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
                scope: 'VelasAccount:Transfer'
            }, processAuthResult);
        },

        login_4: () => {
            vaclient_wrong.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
    
                scope: 'VelasAccountProgram:Transfer'
            }, processAuthResult);
        },

        login_5: () => {
            vaclient_mobile.authorize({
                csrfToken: async function () {
                    const response = await fetch(`${process.env.REACT_APP_SPONSOR_HOST}/csrf`);
                    const result = await response.json();
                    return result.token
                },
    
                scope: 'VelasAccountProgram:Transfer'
            }, processAuthResult);
        },
    };


    return (
        <div className="App">
            <Layout>
                <Background/>
                <Header>
                    <div className="header-components-wrapper">
                        <div className="left-nav">
                            <h1>Demo Donate</h1> 
                            { process.env.REACT_APP_NETWORK_HOST === "https://api.testnet.velas.com" && <Button type="primary" onClick={()=> {window.location.href = 'https://account-demo-shop.testnet.velas.com'}} size={'large'}><ShoppingCartOutlined /> Demo Shop</Button>}
                        </div>
                      

                        <div className="header-actions">
                            { !loading && session && userinfo &&
                                <Dropdown overlay={<Menu><Menu.Item onClick={logout}><LogoutOutlined/><span> Logout </span></Menu.Item><Menu.Item><UserSwitchOutlined/><a href={`http://${process.env.REACT_APP_ACCOUNT_HOST}/account/${session.access_token_payload.sub}`} target="_blank" rel="noopener noreferrer"> Account </a></Menu.Item></Menu>} trigger={['click']}>
                                    <div>
                                        <Avatar icon={<UserOutlined />} />
                                        <span className="account-name">{userinfo.account_name}</span>
                                    </div>
                                </Dropdown>
                            }

                            { !session && !loading && <Button type="primary" onClick={login.default} size={'large'}><UserOutlined/>Login</Button> }
                        </div>
                    </div>
                </Header>
                <Content>
                    <div className="title-block">
                        <h1>Let's try <b>Velas Account</b> in action</h1>
                        <p>See how <b>Velas Account</b> works and helps you improve the safety <br/> of your customers with a seamless experience</p>
                    </div>

                    { error && 
                        <div className="try-demo-section">
                            <div className="error">
                                <h2>Authorization Error</h2>
                                <Error400 className="error-400-image"/>
                                <p>Description: {error}</p>
                                <div className="border">
                                    <div className="progress">
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    { loading  && <Spin className="loading-spin" size="large"/> }
                    { !loading && !error && <DemoSection actions={login}/>}
                </Content>
            </Layout>
      </div>
    );
});

export default App;
