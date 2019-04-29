import { PPSPPClient, SwarmMetadata } from "./src";

const swarmMetadata = new SwarmMetadata(
  Buffer.from("abc", "utf8"),
  0xffffffff,
  2,
  0
);

const client = new PPSPPClient(swarmMetadata, {}, "ws://localhost:8080");

// client.on("chunk", console.log);
// client.on("error", console.error);
