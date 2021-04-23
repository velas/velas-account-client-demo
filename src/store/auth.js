import { observable, action, makeObservable } from "mobx";

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
    
    login      = (authResult) => this.authorization = authResult;
    logout     = ()           => this.authorization = false;
    setLoading = (status)     => this.loading = status;
    setError   = (status)     => this.error = status;
};

export default new AuthStore();