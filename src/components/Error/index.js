import React, { Component } from 'react';

import './style.css' 

class Error extends Component {
    render() {
        const { error } = this.props;
        return(
            <div className="try-demo-section">
                <div className="error">
                    <h2>Authorization Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }
}

export default Error;