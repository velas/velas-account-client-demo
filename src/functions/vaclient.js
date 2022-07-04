import { VAClient }  from '@velas/account-client';

import StorageHandler    from './storageHandler';
import KeyStorageHandler from './keyStorageHandler';

export const agent = {}

export const vaclient = new VAClient({
    mode:        'redirect',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
    accountProviderHost:        process.env.REACT_APP_ACCOUNT_HOST,
    networkApiHost:             process.env.REACT_APP_NETWORK_HOST,
    transactionsSponsorApiHost: process.env.REACT_APP_SPONSOR_HOST,
    transactionsSponsorPubKey:  process.env.REACT_APP_SPONSOR_PUB_KEY,
});

export const vaclient_wrong = new VAClient({
    mode:        'redirect',
    clientID:    'wrong',
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
    accountProviderHost:        process.env.REACT_APP_ACCOUNT_HOST,
    networkApiHost:             process.env.REACT_APP_NETWORK_HOST,
    transactionsSponsorApiHost: process.env.REACT_APP_SPONSOR_HOST,
    transactionsSponsorPubKey:  process.env.REACT_APP_SPONSOR_PUB_KEY,
});

export const vaclient_popup = new VAClient({
    mode:        'popup',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
    accountProviderHost:        process.env.REACT_APP_ACCOUNT_HOST,
    networkApiHost:             process.env.REACT_APP_NETWORK_HOST,
    transactionsSponsorApiHost: process.env.REACT_APP_SPONSOR_HOST,
    transactionsSponsorPubKey:  process.env.REACT_APP_SPONSOR_PUB_KEY,
});

export const vaclient_mobile = new VAClient({
    mode:                       'mobile',
    clientID:                   process.env.REACT_APP_CLIENT_ID,
    redirectUri:                `${process.env.REACT_APP_REDIRECT_URI}/mobile`,
    StorageHandler,
    KeyStorageHandler,
    accountProviderHost:        process.env.REACT_APP_ACCOUNT_HOST,
    networkApiHost:             process.env.REACT_APP_NETWORK_HOST,
    transactionsSponsorApiHost: process.env.REACT_APP_SPONSOR_HOST,
    transactionsSponsorPubKey:  process.env.REACT_APP_SPONSOR_PUB_KEY,
});
