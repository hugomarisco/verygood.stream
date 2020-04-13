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

(async () => {
  const {
    contentIntegrityProtectionMethod,
    liveSignatureAlgorithm,
    swarmId,
    ownershipSignature,
    privateKey,
    trackerUrl,
    tcpServerPort
  } = await CliArgumentsParser.parse();

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

  const WEBAPP_URL = process.env.WEBAPP_URL || "https://www.bitstreamy.com";

  const editBroadcastUrl = `${WEBAPP_URL}/edit?${swarmMetadataSearchParams.toString()}`;

  Logger.info(`Edit your broadcast information: ${editBroadcastUrl}`);

  const client = new PPSPPClient(
    swarmMetadata,
    { liveDiscardWindow: 0xffffffff, privateKey },
    `${trackerUrl}/${swarmMetadataSearchParams.get("swarmId")}`
  );

  client.on("error", err => Logger.error(err));

  const tcpServer = new TCPServer("0.0.0.0", tcpServerPort);

  tcpServer.on("chunk", (chunkIndex: number, data: Buffer) => {
    if (data.length > 262528 - 528) {
      throw new Error("Chunk is too large");
    }

    client.pushChunks(new ChunkSpec([chunkIndex, chunkIndex]), [data]);
  });

  tcpServer.on("end", client.clearChunkStore.bind(client));
})();
