import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import Stream from "./Pages/Stream";

const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
  }
  
  body {
    min-height: 100%;
    background: #fff;
    color: #001F3F;
    font-family: 'Open Sans', sans-serif;
  }
`;

const Index = () => <h2>Home</h2>;

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <GlobalStyle />
          <Route path="/" exact component={Index} />
          <Route path="/:hash" component={Stream} />
        </div>
      </Router>
    );
  }
}

export default App;
