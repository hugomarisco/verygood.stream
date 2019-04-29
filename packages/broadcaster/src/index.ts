import { PPSPPClient, SwarmMetadata } from "@verygood.stream/ppspp-client";
import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod
} from "@verygood.stream/ppspp-protocol";
import { randomBytes } from "crypto";
import { UDPServer } from "./UDPServer";

const swarmMetadata = new SwarmMetadata(
  Buffer.from("abc", "utf8"),
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

const client = new PPSPPClient(swarmMetadata, {}, "ws://localhost:8080");

const udpServer = new UDPServer("localhost", 3333);

udpServer.on("chunk", client.pushChunk.bind(client));
