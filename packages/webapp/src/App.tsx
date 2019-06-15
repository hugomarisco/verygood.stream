import { Provider } from "mobx-react";
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/GlobalStyles";
import { EditStream } from "./pages/EditStream";
import { Home } from "./pages/Home";
import { ViewStream } from "./pages/ViewStream";
import { stores } from "./stores";
import { theme } from "./utils/theme";

class App extends Component {
  public render() {
    return (
      <Provider {...stores}>
        <ThemeProvider theme={theme}>
          <>
            <GlobalStyles />
            <Router>
              <Route path="/" exact component={Home} />
              <Route path="/s/:swarmId/edit" exact component={EditStream} />
              <Route path="/s/:swarmId" exact component={ViewStream} />
            </Router>
          </>
        </ThemeProvider>
      </Provider>
    );
  }
}

export default App;
