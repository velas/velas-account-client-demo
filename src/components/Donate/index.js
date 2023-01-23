import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Card, Radio, Pagination, Empty } from 'antd';
import Jdenticon from 'react-jdenticon';
import { CopyFilled, ClockCircleOutlined, UserOutlined, ArrowDownOutlined, DollarCircleOutlined, MessageOutlined, LinkOutlined, ArrowRightOutlined, RetweetOutlined, WarningOutlined, CheckSquareOutlined } from '@ant-design/icons';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import EVM    from '../../functions/evm';
import NATIVE from '../../functions/native';

import { useStores } from '../../store/RootStore';

import velas from '../../assets/velas.png';
import './style.css';

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US');
const { Meta } = Card;

const isHistoryEnabled = process.env.REACT_APP_HISTORY_HOST;
const isTokensEnabled  = process.env.REACT_APP_NETWORK_HOST === 'https://api.testnet.velas.com' || process.env.REACT_APP_NETWORK_HOST === 'https://api.mainnet.velas.com';

const Donate = () => {

    const { authStore: { userinfo }} = useStores();

    const evm    = new EVM(userinfo.account_key_evm);
    const native = new NATIVE(userinfo.account_key, userinfo.session_key);

    const [balanceNative,        setBalanceNative]        = useState(0);
    const [balanceSessionNative, setBalanceSessionNative] = useState(0);

    const [balance,      setBalance]      = useState(0);
    const [balanceUSDT,  setBalanceUSDT]  = useState(0);
    const [events,       setEvents]       = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [history,      setHistory]      = useState('actions');
    const [range,        setRange]        = useState(1);

    const [evmSponsor, setEvmSponsor] = useState('auto');
    const [nativeSponsor, setNativeSponsor] = useState('auto');

    const transactionNamePretify = (name) => {

        switch(name) {
            case 'Initialize':
                return 'Initialize account'

            case 'AddOperational':
                return 'Login'

            case 'AddProgram':
                return 'Add program'

            case 'AddOwner':
                return 'Add owner'

            case 'ExtendOperational':
                return 'Extend scopes'

            case 'MergeOperational':
                return 'Merge'

            case 'ReplaceOwner':
                return 'Replace owner'

            case 'RemoveOwner':
                return 'Remove owner'

            case 'RemoveOperational':
                return 'Logout'

            case 'RemoveProgramPermission':
                return 'Remove permission'
            
            case 'SponsorAndExecute':
                return 'Sponsor and Execute'

            default:
                return name
        };
    };

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
        //setBalanceNative(await native.getAccountBalance());
        //setBalanceSessionNative(await native.getSessionBalance());
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (userinfo.account_key_evm) {
                evm.events(setEvents);
                if(isHistoryEnabled) evm.transactions(userinfo.account_key, range, setTransactions);
            };
            updateBalance();
        }, 4000);
        return () => clearInterval(intervalId);
    }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateAccountInfo = () => {
        updateBalance();
        
        if (userinfo.account_key_evm) {
            evm.events(setEvents);
            if(isHistoryEnabled) evm.transactions(userinfo.account_key, range, setTransactions);
        };
    };

    const changePage = async (page) => {
        //TO DO: preloader true
        setRange(page);
        if(isHistoryEnabled) evm.transactions(userinfo.account_key, page, (result)=>{
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

        if (!loading && balance && balance > (evm.maxFee + evm.donateAmount)) {
            array.push(<span onClick={()=>{evmTransferTransaction(userinfo.account_key_evm)}}><DollarCircleOutlined key="edit" /> DONATE | {evm.donateAmount}VLX</span>)
        } else {
            array.push(<span className="disabled"><DollarCircleOutlined key="edit" /> DONATE | {evm.donateAmount}VLX</span>)
        };

        if (!loading && balance && balance > evm.maxFee) {
            array.push(<span onClick={()=>{evmContractTransaction(userinfo.account_key_evm)}}><MessageOutlined key="edit" />  MESSAGE</span>)
        } else {
            array.push(<span className="disabled"><MessageOutlined key="edit" />  MESSAGE</span>)
        }

        if (process.env.REACT_APP_FAUCET) array.push(<a href={process.env.REACT_APP_FAUCET} target="_blank" rel="noopener noreferrer" className={balance < evm.maxFee ? 'background-action' : ''}><ArrowDownOutlined key="edit" />  RECEIVE BALANCE</a>)
        
        return array;
    };

    const actionsUSDT = () => {
        const array = [];
        if (!loading && balanceUSDT > evm.donateAmount) { // + blance on native address
        //if (!loading && balance && balance > evm.maxFee && balanceUSDT > evm.donateAmount) {
            array.push(<span onClick={()=>{evmTransferUSDTTransaction(userinfo.account_key_evm)}}><DollarCircleOutlined key="edit" /> DONATE | {evm.donateAmount}USDT</span>)
        } else {
            array.push(<span className="disabled"><DollarCircleOutlined key="edit" /> DONATE | {evm.donateAmount}USDT</span>)
        };
        
        return array;
    };

    // const optionsNative = [
    //     { label: 'Auto', value: 'auto' },
    //     { label: 'My native account', value: 'native' },
    //     { label: 'Sponsor account', value: 'sponsor' },
    // ];

    // const optionsEVM = [
    //     { label: 'Auto', value: 'auto' },
    //     { label: 'My evm account', value: 'evm' },
    //     { label: 'My native account', value: 'native' },
    //     { label: 'Sponsor account', value: 'sponsor' },
    // ];
    
    // const onChangeNativeSponsor = ({ target: { value } }) => {
    //     setNativeSponsor(value);
    // };

    // const onChangeEvmSponsor = ({ target: { value } }) => {
    //     setEvmSponsor(value);
    // };

    return(
        <Row className='donate-component'>
            <Col className='donate-welcome' xs={24} md={6} lg={6}>
                <div className='bg'></div>
                <img alt="velas" src={velas} />
                <h2><b>Velas Account</b></h2>
                <p>Private and Passwordless access with crypto-payment infrastructure on your site in a few easy steps:</p>
                <Button onClick={()=>{window.location.href='https://www.npmjs.com/package/@velas/account-client'}} className="login-button" type="primary"  size={'large'}>Read more</Button>
            </Col>
            <Col className='donate-content' xs={24} md={18} lg={18}>
                
                <div className='user-info'>
                    <Jdenticon className="user-icon" size="80" value={userinfo.account_key_evm} />
                    <h2>Hey! Welcome</h2>
                    <p>
                        <b>{userinfo.account_name}</b>
                    </p>
                </div>

                <div className='evm-info'>
                    <p className='assets'>My assets</p>
                    {/* <Card
                        className='native-asset'
                        >
                        <Meta
                            avatar={<Jdenticon className="user-icon" size="50" value={userinfo.account_key} />}
                            title={'VLX ' + (balanceNative === 0 ? '0.00' : balanceNative)}
                            description={
                                <>
                                    <b>{userinfo.account_key.slice(0,11)}..{userinfo.account_key.substr(-11)}</b>
                                    <CopyFilled className='copy' onClick={() => {
                                        navigator.clipboard.writeText(userinfo.account_key);
                                        message.info(`Copied to clipboard`);
                                    }} />
                                </>
                            }
                        />
                    </Card>
                    <Card
                        className='native-asset'
                        >
                        <Meta
                            avatar={<Jdenticon className="user-icon" size="50" value={userinfo.session_key} />}
                            title={'VLX ' + (balanceSessionNative === 0 ? '0.00' : balanceSessionNative)}
                            description={
                                <>
                                    <b>{userinfo.session_key.slice(0,11)}..{userinfo.session_key.substr(-11)}</b>
                                    <CopyFilled className='copy' onClick={() => {
                                        navigator.clipboard.writeText(userinfo.session_key);
                                        message.info(`Copied to clipboard`);
                                    }} />
                                </>
                            }
                        />
                    </Card> */}
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

                    { isTokensEnabled && <Card
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
                    </Card> }
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
                                <Col className="value"   xs={24} md={1} lg={1}>
                                    {transaction.status === "success"  && <CheckSquareOutlined style={{ fontSize: '20px', marginTop: '5px', color: '#409780' }} /> }
                                    {transaction.status === "reverted" && <WarningOutlined     style={{ fontSize: '20px', marginTop: '5px', color: '#f44336' }} /> }
                                    {transaction.status === "pending"  && <ClockCircleOutlined style={{ fontSize: '20px', marginTop: '5px', color: '#ff9800' }} /> }
                                </Col>  
                                <Col className="hash"    xs={24} md={5} lg={5}> 
                                    { transaction.type === 'evm'    && process.env.REACT_APP_EVMEXPLORER    && <a href={process.env.REACT_APP_EVMEXPLORER + transaction.hash} target="_blank" rel="noopener noreferrer"><LinkOutlined /></a>  }
                                    { transaction.type === 'native' && process.env.REACT_APP_NATIVEEXPLORER && <a href={process.env.REACT_APP_NATIVEEXPLORER + transaction.hash} target="_blank" rel="noopener noreferrer"><LinkOutlined /></a>  }
                                    &nbsp;
                                    {transaction.hash.slice(0,10)}..</Col>
                                <Col className="value"   xs={24} md={5} lg={5}>{ timeAgo.format(new Date(transaction.timestamp * 1000))}</Col>
                                <Col className="value"   xs={24} md={6} lg={6}>{transactionNamePretify(transaction.name)}</Col>

                                <Col className="value"   xs={24} md={3} lg={3}>
                                    {transaction.type === 'native' && transaction.amount && evm.amountToValue(transaction.amount, 10) + ' VLX'}
                                    {transaction.type === 'evm' && transaction.name === 'Send funds'     && evm.amountToValue(transaction.amount, 18) + ' VLX'}
                                    {transaction.type === 'evm' && transaction.name === 'Receive funds'  && evm.amountToValue(transaction.amount, 18) + ' VLX'}
                                    {transaction.type === 'evm' && transaction.name === 'Send tokens'    && evm.amountToValue(transaction.amount, transaction.tokenDecimals) + ' ' + evm.tokenAddressToSymbol(transaction.contractAddress)}
                                    {transaction.type === 'evm' && transaction.name === 'Receive tokens' && evm.amountToValue(transaction.amount, transaction.tokenDecimals) + ' ' + evm.tokenAddressToSymbol(transaction.contractAddress)}
                                    {transaction.name === 'Contract call'  && <RetweetOutlined style={{ fontSize: '20px', marginTop: '5px' }} />}

                                    {transaction.type === 'native' && !transaction.amount && <UserOutlined style={{ fontSize: '20px', marginTop: '5px' }} />}
                                </Col>
                                
                                <Col className="logo"    xs={24} md={1} lg={1}><Jdenticon className="user-icon" size="30" value={transaction.type === 'evm' ? transaction.from : transaction.account} /></Col>

                                { transaction.type === 'evm' && <Col className="value"   xs={24} md={1} lg={1}><ArrowRightOutlined /></Col> }
                                { transaction.type === 'evm' && <Col className="logo"    xs={24} md={1} lg={1}><Jdenticon className="user-icon" size="30" value={transaction.to} /></Col> }

                                { transaction.type === 'native' && transaction.name === 'Receive funds' && <Col className="value"   xs={24} md={1} lg={1}><ArrowRightOutlined /></Col> }
                                { transaction.type === 'native' && transaction.name === 'Receive funds' && <Col className="logo"    xs={24} md={1} lg={1}><Jdenticon className="user-icon" size="30" value={transaction.to} /></Col> }
                            
                                { transaction.type === 'native' && transaction.name === 'Send funds' && <Col className="value"   xs={24} md={1} lg={1}><ArrowRightOutlined /></Col> }
                                { transaction.type === 'native' && transaction.name === 'Send funds' && <Col className="logo"    xs={24} md={1} lg={1}><Jdenticon className="user-icon" size="30" value={transaction.to} /></Col> }
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
