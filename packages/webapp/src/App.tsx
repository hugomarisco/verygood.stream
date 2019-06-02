import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { Reset } from "styled-reset";
import { GlobalStyles } from "./components/GlobalStyles";
import { theme } from "./components/Theme";
import { Home } from "./pages/Home";
import { Stream } from "./pages/Stream";

class App extends Component {
  public render() {
    return (
      <ThemeProvider theme={theme}>
        <>
          <Reset />
          <GlobalStyles />
          <Router>
            <Route path="/" exact component={Home} />
            <Route path="/stream/:swarmId" exact component={Stream} />
          </Router>
        </>
      </ThemeProvider>
    );
  }
}

export default App;
