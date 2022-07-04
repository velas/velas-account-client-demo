import React, { useEffect } from 'react';

import { vaclient_mobile }  from './functions/vaclient';

const Mobile = () => {

    const checkActiveSession = () => {
        vaclient_mobile.handleRedirectCallback((a, b)=>{ console.log(a,b)});
    };

    useEffect(checkActiveSession, []);

    return <h2>...</h2>;
};

export default Mobile;