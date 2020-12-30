import client from 'vortex-account-client-js'; 

export const auth = new client.WebAuth({
    clientID:    process.env.REACT_APP_CLIENT_ID,
    agentDomain: process.env.REACT_APP_AGENT_DOMAIN,
    redirectUri: process.env.REACT_APP_REDIRECT_URI
});
