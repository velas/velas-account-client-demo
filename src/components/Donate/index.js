import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Skeleton, Card, Avatar } from 'antd';
import Jdenticon from 'react-jdenticon';
import { CopyFilled, ArrowDownOutlined, DollarCircleOutlined, MessageOutlined } from '@ant-design/icons';

import EVM from '../../functions/evm';

import { useStores } from '../../store/RootStore';

import velas from '../../assets/velas.png';
import './style.css';

const { Meta } = Card;

const Donate = () => {

    const { authStore: { userinfo }} = useStores();

    const [balance, setBalance] = useState(false);

    const evmContractTransaction = (fromAddress) => {
        EVM.contract(fromAddress, (error, result) => {
            if (error) {
                message.error(error);
            } else {
                EVM.events();
                message.success(result);
            }
        });
    };

    const updateBalance = async () => {
        const amount = await EVM.getBalance(userinfo.account_key_evm);
        setBalance(amount)
    };

    const updateAccountInfo = () => {
        updateBalance();
    };

    useEffect(updateAccountInfo, []);

    return(
        <Row className='donate-component'>
            <Col className='donate-welcome' xs={24} md={8} lg={8}>
                <div className='bg'></div>
                <img alt="velas" src={velas} />
                <h2><b>Velas Account</b></h2>
                <p>Private and Passwordless access with crypto-payment infrastructure on your site in a few easy steps:</p>
                <Button onClick={()=>{window.location.href='https://www.npmjs.com/package/@velas/account-client'}} className="login-button" type="primary"  size={'large'}>Read more</Button>
            </Col>
            <Col className='donate-content' xs={24} md={16} lg={16}>
                
                <div className='user-info'>
                    <Jdenticon className="user-icon" size="80" value={userinfo.account_key} />
                    <h2>Hey! Welcome</h2>
                    <p>
                        <b>{userinfo.account_key.slice(0,6)}..{userinfo.account_key.substr(-6)}</b>
                        <CopyFilled className='copy' onClick={() => {
                            navigator.clipboard.writeText(userinfo.account_key);
                            message.info(`Copied to clipboard`);
                        }} />
                    </p>
                </div>

                <div className='evm-info'>
                    <p className='assets'>My assets</p>
                    <Card
                        className='evm-asset'
                        actions={[
                            <span><DollarCircleOutlined key="edit" />  DONATE</span>,
                            <span onClick={()=>{evmContractTransaction(userinfo.account_key_evm)}}><MessageOutlined key="edit" />  MESSAGE</span>,
                            <span><ArrowDownOutlined key="edit" />  RECIVE BALANCE</span>,
                        ]}
                        >
                        <Skeleton loading={balance === false} avatar active>
                            <Meta
                                avatar={<Jdenticon className="user-icon" size="50" value={userinfo.account_key_evm} />}
                                title={'VLX ' + (balance === '0' ? '0.00' : balance)}
                                description={
                                    <>
                                        <b>{userinfo.account_key_evm.slice(0,12)}..{userinfo.account_key_evm.substr(-12)}</b>
                                        <CopyFilled className='copy' onClick={() => {
                                            navigator.clipboard.writeText(userinfo.account_key_evm);
                                            message.info(`Copied to clipboard`);
                                        }} />
                                    </>
                                }
                            />
                        </Skeleton>
                    </Card>
                </div>

                <div className='actions-info'>
                    <p className='actions'>Last Actions</p>
                </div>
                
            </Col>
        </Row>
    );

};

export default Donate;
