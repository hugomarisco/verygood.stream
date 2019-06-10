import { Provider } from "mobx-react";
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/GlobalStyles";
import { EditStream } from "./pages/EditStream";
import { Home } from "./pages/Home";
import { Stream } from "./pages/Stream";
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
              <Route path="/stream/:swarmId" exact component={Stream} />
              <Route
                path="/stream/:swarmId/edit"
                exact
                component={EditStream}
              />
            </Router>
          </>
        </ThemeProvider>
      </Provider>
    );
  }
}

export default App;
