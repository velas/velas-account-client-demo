import { VAClient }  from '@velas/account-client';

import StorageHandler from './storageHandler';
import KeyStorageHandler from './keyStorageHandler';

export const agent = {}

export const client = new VAClient({
    mode:        'redirect',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
    EVMProviderHost: process.env.REACT_APP_EVM_HOST,
    nativeNodeHost:  process.env.REACT_APP_NODE_HOST,
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