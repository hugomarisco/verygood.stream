import { Provider as MobXProvider } from "mobx-react";
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/GlobalStyles";
import { ViewportProvider } from "./components/ViewportProvider";
import { EditBroadcast } from "./pages/EditBroadcast";
import { Home } from "./pages/Home";
import { ViewBroadcast } from "./pages/ViewBroadcast";
import { stores } from "./stores";
import { theme } from "./utils/theme";

class App extends Component {
  public render() {
    return (
      <MobXProvider {...stores}>
        <ThemeProvider theme={theme}>
          <ViewportProvider>
            <>
              <GlobalStyles />
              <Router>
                <Route path="/" exact component={Home} />
                <Route
                  path="/edit"
                  exact
                  component={EditBroadcast}
                />
                <Route path="/b/:broadcastId" exact component={ViewBroadcast} />
              </Router>
            </>
          </ViewportProvider>
        </ThemeProvider>
      </MobXProvider>
    );
  }
}

export default App;
