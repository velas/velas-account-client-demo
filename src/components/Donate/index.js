import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Card, Radio, Pagination, Empty } from 'antd';
import Jdenticon from 'react-jdenticon';
import { CopyFilled, ArrowDownOutlined, DollarCircleOutlined, MessageOutlined, LinkOutlined, ArrowRightOutlined, RetweetOutlined, WarningOutlined, CheckSquareOutlined } from '@ant-design/icons';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import EVM from '../../functions/evm';

import { useStores } from '../../store/RootStore';

import velas from '../../assets/velas.png';
import './style.css';

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US');
const { Meta } = Card;

const isHistoryEnabled = process.env.REACT_APP_HISTORY_HOST;

function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
};

const Donate = () => {

    const { authStore: { userinfo }} = useStores();

    const evm = new EVM(userinfo.account_key_evm);

    const [balance,      setBalance]      = useState(0);
    const [balanceUSDT,  setBalanceUSDT]  = useState(0);
    const [events,       setEvents]       = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [history,      setHistory]      = useState('actions');
    const [range,        setRange]        = useState(1)

    const evmContractTransaction = async () => {
        setLoading(true);
        evm.contract((error, result) => {
            if (error) {
                message.error(error);
            } else {
                message.success(result);
            };

            setLoading(false);
            setTimeout(updateBalance, 1000);
        });
    };

    const evmTransferTransaction = () => {
        setLoading(true);
        evm.transfer((a) => {
            
            if (a.transactionHash) {
                message.success(a.transactionHash)
            } else {
                message.error(a.message || a);
            };

            setLoading(false);
            setTimeout(updateBalance, 1000);
        });
    };

    const evmTransferUSDTTransaction = () => {
        setLoading(true);
        evm.transferUSDT((error, result) => {
            if (error) {
                message.error(error);
            } else {
                message.success(result);
            };

            setLoading(false);
            setTimeout(updateBalance, 1000);
        });
    };

    const updateBalance = async () => {
        setBalance(await evm.getBalance());
        setBalanceUSDT(await evm.getUSDTBalance());
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (userinfo.account_key_evm) {
                evm.events(setEvents);
                if(isHistoryEnabled) evm.transactions(userinfo.account_key_evm, range, setTransactions);
            };
            updateBalance();
        }, 4000);
        return () => clearInterval(intervalId);
    }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateAccountInfo = () => {
        updateBalance();
        
        if (userinfo.account_key_evm) {
            evm.events(setEvents);
            if(isHistoryEnabled) evm.transactions(userinfo.account_key_evm, range, setTransactions);
        };
    };

    const changePage = async (page) => {
        //TO DO: preloader true
        setRange(page);
        if(isHistoryEnabled) evm.transactions(userinfo.account_key_evm, page, (result)=>{
            //TO DO: preloader false            
            setTransactions(result);
        });
    };

    const handleHisstory = () => {
        setHistory(history === 'actions' ? 'transactions' : 'actions')
    };

    useEffect(updateAccountInfo, []);

    const actions = () => {
        const array = [];

        if (!loading && balance && balance > (evm.maxFee + evm.donateVLX)) {
            array.push(<span onClick={()=>{evmTransferTransaction(userinfo.account_key_evm)}}><DollarCircleOutlined key="edit" />  DONATE</span>)
        } else {
            array.push(<span className="disabled"><DollarCircleOutlined key="edit" />  DONATE</span>)
        };

        if (!loading && balance && balance > evm.maxFee) {
            array.push(<span onClick={()=>{evmContractTransaction(userinfo.account_key_evm)}}><MessageOutlined key="edit" />  MESSAGE</span>)
        } else {
            array.push(<span className="disabled"><MessageOutlined key="edit" />  MESSAGE</span>)
        }

        if (process.env.REACT_APP_FAUCET) array.push(<a href={process.env.REACT_APP_FAUCET} target="_blank" rel="noopener noreferrer" className={balance < evm.maxFee ? 'background-action' : ''}><ArrowDownOutlined key="edit" />  RECIVE BALANCE</a>)
        
        return array;
    };

    const actionsUSDT = () => {
        const array = [];

        if (!loading && balance && balance > evm.maxFee && balanceUSDT > evm.donateVLX) {
            array.push(<span onClick={()=>{evmTransferUSDTTransaction(userinfo.account_key_evm)}}><DollarCircleOutlined key="edit" />  DONATE</span>)
        } else {
            array.push(<span className="disabled"><DollarCircleOutlined key="edit" />  DONATE</span>)
        };
        
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
                    </Card>

                    <Card
                        className='evm-asset'
                        actions={actionsUSDT()}
                        >
                        <Meta
                            avatar={<Jdenticon className="user-icon" size="50" value={userinfo.account_key_evm} />}
                            title={'USDT ' + (balanceUSDT === '0' ? '0.00' : balanceUSDT)}
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
                    </Card>
                </div>

                <div className='actions-info'>
                    { isHistoryEnabled ? <Radio.Group value={history} onChange={()=> { changePage(1); handleHisstory(); }}>
                        <Radio.Button value="actions">Actions</Radio.Button>
                        <Radio.Button value="transactions">Transactions</Radio.Button>
                    </Radio.Group> : <p className='actions'>Last Actions</p> }

                    { history === 'actions' && <Row type="flex">
                        { events && events.length ? events.map((event, index) =>
                            <Row className={'actions-item'} key={index}>
                                <Col className="logo"    xs={24} md={2} lg={2}><Jdenticon className="user-icon" size="30" value={event.from} /></Col>
                                <Col className="address" xs={24} md={10} lg={10}>{event.from.slice(0,8)}..{event.from.substr(-8)}</Col>
                                <Col className="hash"    xs={24} md={6} lg={6}> {process.env.REACT_APP_EVMEXPLORER && <a href={process.env.REACT_APP_EVMEXPLORER + event.hash} target="_blank" rel="noopener noreferrer"><LinkOutlined /></a>} {event.hash.slice(0,12)}..</Col>
                                <Col className="badge"   xs={24} md={2} lg={2}>{event.type === 1 ? <DollarCircleOutlined /> : <MessageOutlined />}</Col>
                                <Col className="value"   xs={24} md={4} lg={4}>{event.value}</Col>
                            </Row>
                        ) : <Empty description="There are no matching entries"/>}
                    </Row> }

                    { history === 'transactions' && <Row type="flex">

                        { transactions && transactions.result ? transactions.result.map((transaction, index) =>
                            <Row className={'actions-item'} key={index}>
                                <Col className="value"   xs={24} md={1} lg={1}>{transaction.status === "success" ? <CheckSquareOutlined style={{ fontSize: '20px', marginTop: '5px', color: '#409780' }} /> : <WarningOutlined style={{ fontSize: '20px', marginTop: '5px', color: '#f44336' }} />}</Col>
                                <Col className="hash"    xs={24} md={5} lg={5}> {process.env.REACT_APP_EVMEXPLORER && <a href={process.env.REACT_APP_EVMEXPLORER + transaction.hash} target="_blank" rel="noopener noreferrer"><LinkOutlined /></a>} {transaction.hash.slice(0,12)}..</Col>
                                <Col className="value"   xs={24} md={5} lg={5}>{ timeAgo.format(new Date(transaction.timestamp * 1000))}</Col>
                                <Col className="value"   xs={24} md={4} lg={4}>{transaction.name}</Col>

                                <Col className="value"   xs={24} md={4} lg={4}>
                                    {transaction.name === 'Send funds'     && evm.amountToValue(transaction.amount) + ' VLX'}
                                    {transaction.name === 'Receive funds'  && evm.amountToValue(transaction.amount) + ' VLX'}
                                    {transaction.name === 'Send tokens'    && evm.amountToValue(transaction.amount) + ' ' + evm.tokenAddressToSymbol(transaction.contractAddress)}
                                    {transaction.name === 'Receive tokens' && evm.amountToValue(transaction.amount) + ' ' + evm.tokenAddressToSymbol(transaction.contractAddress)}
                                    {transaction.name === 'Contract call'  && <RetweetOutlined style={{ fontSize: '20px', marginTop: '5px' }} />}
                                </Col>
                                
                                <Col className="logo"    xs={24} md={2} lg={2}><Jdenticon className="user-icon" size="30" value={transaction.from} /></Col>
                                <Col className="value"   xs={24} md={1} lg={1}><ArrowRightOutlined /></Col>
                                <Col className="logo"    xs={24} md={2} lg={2}><Jdenticon className="user-icon" size="30" value={transaction.to} /></Col>
                            </Row>
                        ) : <Empty description="There are no matching entries"/>}

                        { transactions && <Pagination
                            className='pagination'
                            hideOnSinglePage={true}
                            total={transactions.total}
                            simple={true}
                            defaultPageSize={10}
                            defaultCurrent={1}
                            onChange={changePage} 
                        />}
                        
                    </Row> }
                </div>
                
            </Col>
        </Row>
    );
};

export default Donate;
