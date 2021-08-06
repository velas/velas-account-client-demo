import { VAClient }  from '@velas/account-client';

import StorageHandler    from './storageHandler';
import KeyStorageHandler from './keyStorageHandler';

export const agent = {}

export const vaclient = new VAClient({
    mode:        'redirect',
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    StorageHandler,
    KeyStorageHandler,
    nativeNodeHost:  process.env.REACT_APP_NODE_HOST,
});
