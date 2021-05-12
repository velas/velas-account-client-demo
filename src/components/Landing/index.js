import React, { Component } from "react";

import { Demo } from '../'

import screen from '../../assets/screen.png'; // with import

class Landing extends Component {
    render() {
        return (
          <div className="landing">
                <div className="left-section">
                    <Demo/>
                </div>

                <div className="right-section">
                    <img alt="pc" src={screen} />
                </div>
          </div>
        )
    }

}

export default Landing