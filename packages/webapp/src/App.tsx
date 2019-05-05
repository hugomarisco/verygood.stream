import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Swarm } from "./pages/Swarm";

class App extends Component {
  public render() {
    return (
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/swarm/:swarmId" exact component={Swarm} />
      </Router>
    );
  }
}

export default App;
