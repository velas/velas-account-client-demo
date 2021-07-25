import { observable, action, makeObservable } from "mobx";

import { client } from '../functions/auth'

class AuthStore {
    authorization = false;
    loading       = true;
    error         = false;
    
    constructor() {
        makeObservable(this, {
            authorization: observable,
            loading: observable,
            error: observable,
            login: action,
        });
    };
    
    login      = (authResult) => {
        this.error = false;
        this.authorization = authResult;
        client.defaultAccount(authResult);
        localStorage.setItem('session', JSON.stringify(authResult));
    };

    logout     = ()           => {
        this.authorization = false;
        localStorage.removeItem('session');
    };
    
    setLoading = (status)     => this.loading = status;
    setError   = (status)     => this.error = status;
};

export default new AuthStore();