import { PPSPPClient, SwarmMetadata } from "@verygood.stream/ppspp-client";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod
} from "@verygood.stream/ppspp-protocol";
import { randomBytes } from "crypto";

const swarmMetadata = new SwarmMetadata(
  Buffer.from("abc", "utf8"),
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

const client = new PPSPPClient(swarmMetadata, {}, "ws://localhost:8080");

// client.on("chunk", console.log);
// client.on("error", console.error);

let i = 0;

setInterval(() => {
  client.pushChunk(i, randomBytes(1));
  i += 1;
}, 500);
