#!/usr/bin/env node

import {
  ChunkAddressingMethod,
  ChunkSpec,
  PPSPPClient,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import { CliArgumentsParser } from "./CliArgumentsParser";
import { Logger } from "./Logger";
import { TCPServer } from "./TCPServer";

const {
  contentIntegrityProtectionMethod,
  liveSignatureAlgorithm,
  swarmId,
  publicKeyFingerprint,
  liveDiscardWindow,
  privateKey,
  trackerUrl,
  tcpServerPort
} = CliArgumentsParser.parse();

const queryParams: {
  swarmId: string;
  contentIntegrityProtectionMethod: number;
  liveSignatureAlgorithm?: number;
} = {
  contentIntegrityProtectionMethod,
  swarmId: publicKeyFingerprint
};

if (liveSignatureAlgorithm) {
  queryParams.liveSignatureAlgorithm = liveSignatureAlgorithm;
}

const encodedParams = Object.keys(queryParams)
  .map(k => `${k}=${encodeURIComponent(queryParams[k])}`)
  .join("&");

Logger.info("URL", {
  swarmId: swarmId.toString("base64"),
  url: `http://localhost:3000/stream?${encodedParams}`
});

const swarmMetadata = new SwarmMetadata(
  swarmId,
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  contentIntegrityProtectionMethod,
  liveSignatureAlgorithm
);

const client = new PPSPPClient(
  swarmMetadata,
  { liveDiscardWindow, privateKey },
  `${trackerUrl}/${encodeURIComponent(swarmId.toString("base64"))}`
);

const tcpServer = new TCPServer("localhost", tcpServerPort);

tcpServer.on("chunk", (chunkIndex: number, data: Buffer) =>
  client.pushChunks(new ChunkSpec([chunkIndex, chunkIndex]), [data])
);

tcpServer.on("end", client.clearChunkStore.bind(client));
