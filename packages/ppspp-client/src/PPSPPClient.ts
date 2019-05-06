import {
  AckMessage,
  ChunkSpec,
  DataMessage,
  ProtocolOptions
} from "@bitstreamy/ppspp-protocol";
import { Duplex } from "stream";
import { ChunkStore } from "./ChunkStore";
import { Logger } from "./Logger";
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
  private chunkStore: ChunkStore;

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

    this.chunkStore = new ChunkStore(liveDiscardWindow);

    this.peers = {};

    this.tracker = new TrackerClient(trackerUrl);

    this.tracker.on("peerSocket", this.onPeerSocket.bind(this));
    this.tracker.on("error", this.emit.bind(this, "error"));
  }

  public pushChunk(chunkId: number, data: Buffer) {
    this.chunkStore.setChunk(chunkId, data);

    this.chunkStore.discardOldChunks();

    Object.keys(this.peers).forEach(peerId => this.peers[peerId].have(chunkId));
  }

  public requestChunk(chunkId: number) {
    Object.keys(this.peers).forEach(peerId =>
      this.peers[peerId].request(new ChunkSpec([chunkId, chunkId]))
    );
  }

  public clearChunkStore() {
    this.chunkStore = new ChunkStore(this.protocolOptions.liveDiscardWindow);
  }

  private onPeerSocket(peerSocket: WebRTCSocket, isInitiator: boolean) {
    const remotePeer = new RemotePeer(
      peerSocket,
      this.protocolOptions,
      this.chunkStore
    );

    this.peers[remotePeer.peerId] = remotePeer;

    this.emit("peer");

    remotePeer.on("error", this.onPeerClose.bind(this, remotePeer.peerId));

    remotePeer.on("close", this.onPeerClose.bind(this, remotePeer.peerId));

    remotePeer.on("dataMessage", (message: DataMessage) => {
      const [chunkIndex] = message.chunkSpec.spec as [number, number];

      if (!this.chunkStore.getChunk(chunkIndex)) {
        this.chunkStore.setChunk(chunkIndex, message.data);

        this.chunkStore.discardOldChunks();

        this.emit("chunk", chunkIndex, message.data);
      }
    });

    if (isInitiator) {
      remotePeer.handshake();
    }
  }

  private onPeerClose(peerId: number) {
    Logger.info("Peer closed connection", { peerId });

    delete this.peers[peerId];
  }
}
