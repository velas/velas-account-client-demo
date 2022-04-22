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
    const [events,   setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const evmContractTransaction = (fromAddress) => {
        EVM.contract(fromAddress, (error, result) => {
            if (error) {
                message.error(error);
            } else {
                message.success(result);
            };

            setTimeout(updateBalance, 1000);
        });
    };

    const evmTransferTransaction = (fromAddress) => {
        EVM.transfer(fromAddress, (a) => {
            if (a.transactionHash) {
                message.success(a.transactionHash)
            } else {
                message.error(a.message || a);
            }

            setTimeout(updateBalance, 1000);
        });
    };

    const updateBalance = async () => {
        setBalance(await EVM.getBalance(userinfo.account_key_evm));
    };

    const updateEvents = async () => {
        setLoading(true);
        EVM.events((a) => {
            setLoading(false);
            setEvents(a);
        });
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            EVM.events(setEvents);
            updateBalance();
        }, 7000);
        return () => clearInterval(intervalId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const updateAccountInfo = () => {
        updateBalance();
        updateEvents();
    };

    useEffect(updateAccountInfo, []);

    const actions = () => {
        const array = [];

        if (balance && balance > (EVM.maxFee + EVM.donateVLX)) {
            array.push(<span onClick={()=>{evmTransferTransaction(userinfo.account_key_evm)}}><DollarCircleOutlined key="edit" />  DONATE</span>)
        } else {
            array.push(<span className="disabled"><DollarCircleOutlined key="edit" />  DONATE</span>)
        };

        if (balance && balance > EVM.maxFee) {
            array.push(<span onClick={()=>{evmContractTransaction(userinfo.account_key_evm)}}><MessageOutlined key="edit" />  MESSAGE</span>)
        } else {
            array.push(<span className="disabled"><MessageOutlined key="edit" />  MESSAGE</span>)
        }

        if (
            process.env.REACT_APP_ENV === "devnet" ||
            process.env.REACT_APP_ENV === "testnet"
        ) array.push(<span className={balance < EVM.maxFee ? 'background-action' : ''}><ArrowDownOutlined key="edit" />  RECIVE BALANCE</span>)
        
        return array;
    };

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
                        actions={actions()}
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
                    <Row type="flex">
                        { loading && <Skeleton paragraph={{rows: 8}}/> }
                        { !loading && events && events.map((event, index) =>
                            <Row className={'actions-item'} key={index}>
                                <Col className="logo"    xs={4} md={2} lg={2}><Jdenticon className="user-icon" size="30" value={event.from} /></Col>
                                <Col className="address" xs={20} md={10} lg={10}>{event.from.slice(0,8)}..{event.from.substr(-8)}</Col>
                                <Col className="hash"    xs={24} md={6} lg={6}>{event.hash.slice(0,8)}..</Col>
                                <Col className="badge"   xs={4} md={2} lg={2}>{event.type === 1 ? <DollarCircleOutlined /> : <MessageOutlined />}</Col>
                                <Col className="value"   xs={20} md={4} lg={4}>{event.value}</Col>
                            </Row>
                        )}
                    </Row>
                </div>
                
            </Col>
        </Row>
    );
};

export default Donate;
