import { observable, action, makeObservable } from "mobx";

import { vaclient } from '../functions/vaclient'

class AuthStore {
    session  = false;
    loading  = true;
    error    = false;
    userinfo = false;
    
    constructor() {
        makeObservable(this, {
            session:  observable,
            loading:  observable,
            error:    observable,
            userinfo: observable,
            setCurrentSession: action,
            setUserinfo:       action,
            logout:            action,
            findActiveSession: action,
            setLoading:        action,
            setError:          action,
        });
    };

    findActiveSession = () => {
        const session = localStorage.getItem('session');

        try {
            this.session = JSON.parse(session);
            vaclient.defaultAccount(this.session);
            this.error = false;
        } catch (_) {};

        return this.session;
    };
    
    setCurrentSession = (session) => {
        this.session = session;
        vaclient.defaultAccount(session);
        localStorage.setItem('session', JSON.stringify(session));
    };

    setUserinfo = (userinfo) => {
        this.userinfo = userinfo;
    };

    logout = () => {
        this.session  = false;
        this.userinfo = false;
        localStorage.removeItem('session');
    };
    
    setLoading = (status)     => this.loading = status;
    setError   = (status)     => {
        this.loading = false;
        this.error = status;
    };
};

export default new AuthStore();
