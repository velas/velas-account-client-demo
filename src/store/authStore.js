import { observable, action, makeObservable } from "mobx";

import { vaclient } from '../functions/vaclient'

class AuthStore {
    session = false;
    loading = true;
    error   = false;
    
    constructor() {
        makeObservable(this, {
            session: observable,
            loading: observable,
            error:   observable,
            setCurrentSession: action,
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
            this.loading = false;
            this.error = false;
        } catch (_) {}
    };
    
    setCurrentSession = (session) => {
        this.session = session;
        vaclient.defaultAccount(session);
        localStorage.setItem('session', JSON.stringify(session));
    };

    logout = () => {
        this.session = false;
        localStorage.removeItem('session');
    };
    
    setLoading = (status)     => this.loading = status;
    setError   = (status)     => {
        this.loading = false;
        this.error = status;
    };
};

export default new AuthStore();
