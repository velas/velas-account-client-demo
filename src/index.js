import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Routes,
    Route
  } from "react-router-dom";

import App    from './App';
import Mobile from './Mobile';
import * as serviceWorker from './serviceWorker';

import 'antd/dist/antd.css';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/"       element={<App />}/>
                <Route path="/mobile" element={<Mobile />} />
            </Routes>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);

serviceWorker.unregister();
