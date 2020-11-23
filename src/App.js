import React from 'react';
import { Layout } from 'antd';

import { Landing } from './components'

const { Header, Content } = Layout;

function App() {
    return (
      <div className="App">
          <Layout>
              <Header>
                  <h1>demosite</h1>
              </Header>
              <Content>
                  <Landing/>
              </Content>
          </Layout>
      </div>
    );
}

export default App;
