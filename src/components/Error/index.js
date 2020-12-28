import React, { Component } from 'react';

import './style.css'

class Error extends Component {
    render() {
        const { error } = this.props;
        return(
            <div className="error">
                <h2>Authorization Error</h2>
                <p>{error}</p>
            </div>
        )
    }
}

export default Error;