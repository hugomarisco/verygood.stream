import { PPSPPClient, SwarmMetadata } from "@verygood.stream/ppspp-client";
import React, { Component } from "react";

class App extends Component {
  public componentDidMount() {
    const swarmMetadata = new SwarmMetadata(
      Buffer.from("abc", "utf8"),
      0xffffffff,
      2,
      0
    );

    const client = new PPSPPClient(swarmMetadata, {}, "ws://localhost:8080");

    client.on("chunk", chunk => console.log(chunk.length));
    client.on("error", console.error);
  }

  public render() {
    return <div />;
  }
}

export default App;
