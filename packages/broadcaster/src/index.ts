#!/usr/bin/env node

import {
  ChunkAddressingMethod,
  ChunkSpec,
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm,
  PPSPPClient,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import Commander from "commander";
import { readFileSync } from "fs";
import { pki, util as forgeUtil } from "node-forge";
import { v4 as UUIDv4 } from "uuid";
import { version } from "../package.json";
import { Logger } from "./Logger";
import { TCPServer } from "./TCPServer";

const cli = new Commander.Command()
  .version(version)
  .option("-P|--port <port>", "Port to bind the media listener", "3333")
  .option("-K|--private-key <file>", "RSA private key to sign data messages")
  .option(
    "-I|--integrity-protection <NONE|SIGN-ALL>",
    "Algorithm to sign data messages",
    /^(NONE|SIGN-ALL)$/i,
    "SIGN-ALL"
  )
  .option(
    "-S|--live-signature-algo <RSASHA1|RSASHA256>",
    "Algorithm to sign data messages",
    /^(RSASHA1|RSASHA256)$/i,
    "RSASHA256"
  )
  .option("-D|--discard-window <integer>", "Live discard window", "100")
  .parse(process.argv);

const tcpServerPort = parseInt(cli.port, 10);
const liveDiscardWindow = parseInt(cli.discardWindow, 10);

let swarmId: Buffer;
let liveSignatureAlgorithm: number | undefined;
let contentIntegrityProtectionMethod: number;
let privateKey: any;

switch (cli.integrityProtection) {
  case "SIGN-ALL":
    contentIntegrityProtectionMethod =
      ContentIntegrityProtectionMethod.SIGN_ALL;

    switch (cli.liveSignatureAlgo) {
      case "RSASHA1":
        liveSignatureAlgorithm = LiveSignatureAlgorithm.RSASHA1;
        break;
      case "RSASHA256":
        liveSignatureAlgorithm = LiveSignatureAlgorithm.RSASHA256;
        break;
      default:
        throw new Error("Invalid live signature algorithm");
    }

    privateKey = cli.privateKey
      ? pki.privateKeyFromPem(readFileSync(cli.privateKey))
      : pki.rsa.generateKeyPair({ bits: 1024, e: 65537 }).privateKey;

    const n = Buffer.from(
      forgeUtil.binary.hex.decode(privateKey.n.toString(16))
    );

    const e = Buffer.from(
      forgeUtil.binary.hex.decode(privateKey.e.toString(16))
    );

    let eLength: Buffer;

    if (e.length <= 255) {
      eLength = Buffer.alloc(1);
      eLength.writeUInt8(e.length, 0);
    } else {
      eLength = Buffer.alloc(3);
      eLength.writeInt8(0, 0);
      eLength.writeUInt16BE(e.length, 1);
    }

    swarmId = Buffer.concat([
      Buffer.from([liveSignatureAlgorithm]),
      eLength,
      e,
      n
    ]);

    break;
  case "NONE":
  default:
    contentIntegrityProtectionMethod = ContentIntegrityProtectionMethod.NONE;

    swarmId = Buffer.from(UUIDv4(), "utf-8");
}

const queryParams: {
  swarmId: string;
  contentIntegrityProtectionMethod: number;
  liveSignatureAlgorithm?: number;
} = {
  contentIntegrityProtectionMethod,
  swarmId: swarmId.toString("base64")
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
  `wss://tracker.bitstreamy.com/${encodeURIComponent(
    swarmId.toString("base64")
  )}`
);

const tcpServer = new TCPServer("localhost", tcpServerPort);

tcpServer.on("chunk", (chunkIndex: number, data: Buffer) =>
  client.pushChunks(new ChunkSpec([chunkIndex, chunkIndex]), [data])
);

tcpServer.on("end", client.clearChunkStore.bind(client));
