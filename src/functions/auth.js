import * as solanaWeb3 from '@velas/solana-web3';
import { Auth, Web3 } from 'vortex-account-client-js';
//import Agent  from '@velas/account-agent';

import StorageHandler from './storageHandler';
import KeyStorageHandler from './keyStorageHandler';

export const web3 = Web3(solanaWeb3);

// export const agent = new Agent({
//     client_host:              process.env.REACT_APP_NODE_HOST,
//     client_account_contract:  process.env.REACT_APP_ACCOUNT_CONRACT,
//     backend_payer_public_key: process.env.REACT_APP_BACKEND_ACCOUNT,
//     client_provider:          solanaWeb3,
//     StorageHandler,
//     KeyStorageHandler,
// });

export const agent = {}

export const client_redirect_mode = new Auth({
    mode:        'redirect',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
});

export const client_popup_mode = new Auth({
    mode:        'popup',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
});

export const client_direct_mode = new Auth({
    mode:        'direct',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    agent,
    StorageHandler,
    KeyStorageHandler,
});
