import { PPSPPClient } from "@verygood.stream/ppspp-client";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod
} from "@verygood.stream/ppspp-protocol";
import { randomBytes } from "crypto";

// const chunkSize = 10;

// const swarmMetadata = new ClientSwarmMetadata(
//   Buffer.from("abc", "utf8"),
//   chunkSize,
//   ChunkAddressingMethod["32ChunkRanges"],
//   ContentIntegrityProtectionMethod.NONE
// );

// const client = new PPSPPClient(swarmMetadata, {}, "ws://localhost:8080");

// let i = 0;

// setInterval(() => {
//   client.pushChunk(i * chunkSize, randomBytes(chunkSize));
//   i += 1;
// }, 5000);
