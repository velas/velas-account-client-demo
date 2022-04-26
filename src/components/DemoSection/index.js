
import React, { useState } from "react";
import { observer } from 'mobx-react'
import { Popover, Button } from 'antd';

import {useStores} from '../../store/RootStore'
import Donate from '../../components/Donate';

import './index.css';

const DemoSection = observer(({ actions }) => {
    const { authStore: { session, userinfo }} = useStores();
    const [count, setCount]         = useState(0);

    return (
        <div className="demo">
            <>
                {  session && userinfo && <Donate/> }
                { !session && 
                    <div className="try-demo-section">
                        <span onClick={() => setCount(count + 1)} className="demo-logo">D</span>
                        <h1>Log in</h1>
                        <h4>to <b>Demo site</b> to continue:</h4>
                        <Button onClick={actions.default} className="login-button" type="primary"  size={'large'}>Login with Velas Account</Button>

                        { count >= 10 && <>
                            <p>____<br/><br/></p>
                            <p>Login to test <Popover content={"'VelasAccount:Transfer VelasAccountProgram:Execute EVM:Execute'"} title="scopes:"><b>init account</b></Popover> flow</p>
                            <Button onClick={actions.login_2} className="login-button" type="primary"  size={'large'}>Login with Velas Account</Button>

                            <p>Login to test <Popover content={"'authorization'"} title="scopes:"><b>sign challenge</b></Popover> flow</p>
                            <Button onClick={actions.login_1} className="login-button" type="primary"  size={'large'}>Login with Velas Account</Button>

                            <p>Login to test <Popover content={"'VelasAccount:Transfer'"} title="scopes:"><b>wrong scopes</b></Popover> flow</p>
                            <Button onClick={actions.login_3} className="login-button" type="primary"  size={'large'}>Login with Velas Account</Button>

                            <p>Login to test <Popover content={"'VelasAccountProgram:Transfer'"} title="scopes:"><b>wrong client_id</b></Popover> flow</p>
                            <Button onClick={actions.login_4} className="login-button" type="primary"  size={'large'}>Login with Velas Account</Button>
                        </>}
                    </div>
                }
            </>
        </div>
    );
});

export default DemoSection;
