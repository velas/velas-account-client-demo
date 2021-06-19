import * as solanaWeb3 from '@velas/solana-web3';
import { Auth, Web3 }  from '@velas/account-client';

import StorageHandler from './storageHandler';
import KeyStorageHandler from './keyStorageHandler';

export const web3 = Web3(solanaWeb3);

export const agent = {}

export const client = new Auth({
    mode:        'popup',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
});


export const authorizeCallBack = (auth) => {
    return (err, authResult) => {
        if (authResult && authResult.access_token_payload) {
            auth.login(authResult);
            auth.setLoading(false);
        } else if (err) {
            auth.setError(err.description);
            auth.setLoading(false);
        } else {
            const authResult = localStorage.getItem('session');
            try {
                if (authResult) auth.login(JSON.parse(authResult));
            } catch(_) {};

            auth.setLoading(false);
        };
        window.history.replaceState('', '', window.location.href.split('?')[0]);
    };
};