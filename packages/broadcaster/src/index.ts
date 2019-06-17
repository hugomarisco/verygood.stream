#!/usr/bin/env node

import {
  base64UrlEscape,
  ChunkAddressingMethod,
  Logger,
  SwarmMetadata
} from "@bitstreamy/commons";
import { ChunkSpec, PPSPPClient } from "@bitstreamy/ppspp-client";
import { CliArgumentsParser } from "./CliArgumentsParser";
import { TCPServer } from "./TCPServer";

const {
  contentIntegrityProtectionMethod,
  liveSignatureAlgorithm,
  swarmId,
  liveDiscardWindow,
  ownershipSignature,
  privateKey,
  trackerUrl,
  tcpServerPort
} = CliArgumentsParser.parse();

const swarmMetadata = new SwarmMetadata(
  swarmId,
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  contentIntegrityProtectionMethod,
  liveSignatureAlgorithm
);

const swarmMetadataSearchParams = swarmMetadata.toSearchParams();

swarmMetadataSearchParams.append(
  "ownershipSignature",
  base64UrlEscape(ownershipSignature.toString("base64"))
);

Logger.info("Edit your broadcast information", {
  url: `http://localhost:3000/s/edit?${swarmMetadataSearchParams.toString()}`
});

const client = new PPSPPClient(
  swarmMetadata,
  { liveDiscardWindow, privateKey },
  `${trackerUrl}/${swarmMetadataSearchParams.get("swarmId")}`
);

const tcpServer = new TCPServer("localhost", tcpServerPort);

tcpServer.on("chunk", (chunkIndex: number, data: Buffer) =>
  client.pushChunks(new ChunkSpec([chunkIndex, chunkIndex]), [data])
);

tcpServer.on("end", client.clearChunkStore.bind(client));
