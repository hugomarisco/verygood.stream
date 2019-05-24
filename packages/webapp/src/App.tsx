import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { Reset } from "styled-reset";
import { GlobalStyles } from "./components/GlobalStyles";
import { theme } from "./components/Theme";
import { Home } from "./pages/Home";
import { Swarm } from "./pages/Swarm";

class App extends Component {
  public render() {
    return (
      <ThemeProvider theme={theme}>
        <>
          <Reset />
          <GlobalStyles />
          <Router>
            <Route path="/" exact component={Home} />
            <Route path="/stream" exact component={Swarm} />
          </Router>
        </>
      </ThemeProvider>
    );
  }
}

export default App;
