import {
  ClientSwarmMetadata,
  PPSPPClient
} from "@verygood.stream/ppspp-client";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod
} from "@verygood.stream/ppspp-protocol";
import React, { Component } from "react";

const chunkSize = 10;

const swarmMetadata = new ClientSwarmMetadata(
  Buffer.from("abc", "utf8"),
  chunkSize,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

class App extends Component {
  public componentDidMount() {
    const client = new PPSPPClient(swarmMetadata, {}, ["ws://localhost:8080"]);

    client.on("chunk", console.log);
  }

  public render() {
    return <div />;
  }
}

export default App;
