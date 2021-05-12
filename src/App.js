import React from 'react';
import { observer } from 'mobx-react'
import { Layout, Avatar, Button, Menu, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';

import { Landing, Background } from './components'
import { useStores } from './store/RootStore'

import { client_redirect_mode }  from './functions/auth';

const { Header, Content } = Layout;

const App = observer(() => {
    const { auth } = useStores();

    const login = () => client_redirect_mode.authorize({ scope: 'VAcccHVjpknkW5N5R9sfRppQxYJrJYVV7QJGKchkQj5:11' });

    const menu = () => {
        return <Menu><Menu.Item onClick={auth.logout}><span>Logout</span></Menu.Item></Menu>
    };

    return (
        <div className="App">
            <Layout>
                <Background/>
                <Header>
                    <div className="header-components-wrapper">
                        <h1>Demo Site</h1>
                        <div className="header-actions"> 
                            { auth.authorization
                                ? <Dropdown overlay={menu} trigger={['click']}>
                                    <div>
                                        <Avatar icon={<UserOutlined />} />
                                        <span className="account-name">{auth.authorization.access_token_payload.sub.slice(0,4)}..{auth.authorization.access_token_payload.sub.substr(-4)}</span>
                                    </div>
                                  </Dropdown>
                                : <Button type="primary" onClick={login} size={'large'}>Login</Button>
                            }
                        </div>
                    </div>
                </Header>
                <Content>
                    <Landing/>
                </Content>
            </Layout>
      </div>
    );
});

export default App;
