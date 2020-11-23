import client from 'vortex-account-client-js'; 

export const auth = new client.WebAuth({
    clientID: 'democlientid',
    agentDomain: 'localhost:3001',
    redirectUri: 'http://localhost:3000/'
});
