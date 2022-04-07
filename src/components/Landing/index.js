import React, { Component } from "react";

import { Demo } from '../'

class Landing extends Component {
    render() {
        return (
          <div className="landing">
                <div className="left-section">
                    <Demo/>
                </div>
          </div>
        )
    }

}

export default Landing