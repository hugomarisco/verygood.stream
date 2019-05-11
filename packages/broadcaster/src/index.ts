import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm,
  PPSPPClient,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import { pki, md, util } from "node-forge";
import { Logger } from "./Logger";
import { TCPServer } from "./TCPServer";

const liveSignatureAlgorithm = LiveSignatureAlgorithm.RSASHA256;

const liveSignatureAlgorithmBuf = Buffer.alloc(1);
liveSignatureAlgorithmBuf.writeInt8(liveSignatureAlgorithm, 0);

const keypair = pki.rsa.generateKeyPair({ bits: 1024, e: 65537 });

const n = Buffer.from(keypair.publicKey.n.toByteArray().slice(1));
const e = Buffer.from(keypair.publicKey.e.toByteArray());

let eLength: Buffer;

if (e.length <= 255) {
  eLength = Buffer.alloc(1);
  eLength.writeUInt8(e.length, 0);
} else {
  eLength = Buffer.alloc(3);
  eLength.writeUInt16BE(e.length, 1);
}

const swarmId = Buffer.concat([liveSignatureAlgorithmBuf, eLength, e, n]);

const d = md.sha256.create();

d.update("a");

const signature = Buffer.from(
  util.binary.raw.decode(keypair.privateKey.sign(d))
);

Logger.info("Swarm ID generated", {
  swarmId: swarmId.toString("base64"),
  signature: signature.toString("base64")
});

const swarmMetadata = new SwarmMetadata(
  swarmId,
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.SIGN_ALL,
  liveSignatureAlgorithm
);

const client = new PPSPPClient(
  swarmMetadata,
  { liveDiscardWindow: 100, privateKey: keypair.privateKey },
  "wss://tracker.bitstreamy.com"
);

const tcpServer = new TCPServer("localhost", 3333);

tcpServer.on("chunk", client.pushChunk.bind(client));

tcpServer.on("end", client.clearChunkStore.bind(client));
