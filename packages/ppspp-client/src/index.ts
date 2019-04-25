import {
  AckMessage,
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  DataMessage,
  ProtocolOptions
} from "@verygood.stream/ppspp-protocol";
import { Duplex } from "stream";
import { RemotePeer } from "./RemotePeer";
import { SwarmMetadata } from "./SwarmMetadata";
import { TrackerClient } from "./TrackerClient";
import { WebRTCSocket } from "./WebRTCSocket";

export class PPSPPClient extends Duplex {
  private static PROTOCOL_VERSION = 1;
  private static SUPPORTED_MESSAGES = [AckMessage.CODE];

  private tracker: TrackerClient;
  private peers: { [peerId: string]: RemotePeer };
  private protocolOptions: ProtocolOptions;
  private chunkStore: Buffer[];

  constructor(
    metadata: SwarmMetadata,
    { liveDiscardWindow = 10 }: { liveDiscardWindow?: number },
    trackerUrl: string
  ) {
    super();

    const {
      swarmId,
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod
      /*merkleHashFunction,
      liveSignatureAlgorithm*/
    } = metadata;

    if (chunkSize !== 0xffffffff) {
      throw new Error("Fixed chunk sizes are not supported");
    }

    this.protocolOptions = new ProtocolOptions(
      PPSPPClient.PROTOCOL_VERSION,
      contentIntegrityProtectionMethod,
      chunkAddressingMethod,
      liveDiscardWindow,
      chunkSize,
      PPSPPClient.SUPPORTED_MESSAGES,
      PPSPPClient.PROTOCOL_VERSION,
      swarmId
      /*liveSignatureAlgorithm,
      merkleHashFunction,*/
    );

    this.chunkStore = [];

    this.peers = {};

    this.tracker = new TrackerClient(trackerUrl, swarmId);

    this.tracker.on("peerSocket", this.onPeerSocket.bind(this));
    this.tracker.on("error", this.emit.bind(this, "error"));
  }

  public pushChunk(chunkId: number, data: Buffer) {
    this.chunkStore[chunkId] = data;

    Object.keys(this.peers).forEach(peerId => this.peers[peerId].have(chunkId));
  }

  private onPeerSocket(peerSocket: WebRTCSocket) {
    const remotePeer = new RemotePeer(
      peerSocket,
      this.protocolOptions,
      this.chunkStore
    );

    this.peers[remotePeer.peerId] = remotePeer;

    remotePeer.handshake();

    remotePeer.on("error", this.emit.bind(this, "error"));

    remotePeer.on("dataMessage", (message: DataMessage) => {
      const [chunkIndex] = message.chunkSpec.spec as [number, number];

      if (!this.chunkStore[chunkIndex]) {
        this.chunkStore[chunkIndex] = message.data;
        this.emit.bind(null, "chunk");
      }
    });
  }
}

const swarmMetadata = new SwarmMetadata(
  Buffer.from("aaa", "utf-8"),
  0xffffffff,
  ChunkAddressingMethod["32ChunkRanges"],
  ContentIntegrityProtectionMethod.NONE
);

const client = new PPSPPClient(swarmMetadata, {}, "ws://localhost:8080/abc");

client.on("error", console.log);
