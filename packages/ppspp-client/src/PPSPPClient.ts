import { Logger, SwarmMetadata } from "@bitstreamy/commons";
import {
  AckMessage,
  ChunkSpec,
  DataMessage,
  ProtocolOptions
} from "@bitstreamy/ppspp-protocol";
import { Client as TrackerClient } from "@bitstreamy/tracker";
import { Duplex } from "stream";
import { ChunkStore } from "./ChunkStore";
import { RemotePeer } from "./RemotePeer";

export class PPSPPClient extends Duplex {
  private static PROTOCOL_VERSION = 1;
  private static SUPPORTED_MESSAGES = [AckMessage.CODE];

  private peers: { [peerId: string]: RemotePeer };
  private protocolOptions: ProtocolOptions;
  private chunkStore: ChunkStore;
  private privateKey?: any;

  constructor(
    metadata: SwarmMetadata,
    {
      liveDiscardWindow = 100,
      privateKey
    }: { liveDiscardWindow?: number; privateKey?: any },
    trackerUrl: string
  ) {
    super();

    const {
      swarmId,
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod,
      liveSignatureAlgorithm
      // merkleHashFunction,
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
      swarmId,
      liveSignatureAlgorithm
      // merkleHashFunction,
    );

    this.privateKey = privateKey;

    this.chunkStore = new ChunkStore(liveDiscardWindow);

    this.peers = {};

    const tracker = new TrackerClient(trackerUrl);

    tracker.on("peerSocket", this.onPeerSocket.bind(this));
  }

  public pushChunks(chunkSpec: ChunkSpec, data: Buffer[]) {
    this.chunkStore.setChunks(chunkSpec, data);

    this.chunkStore.discardOldChunks();

    Object.keys(this.peers).forEach(peerId =>
      this.peers[peerId].have(chunkSpec)
    );
  }

  public requestChunks(chunkSpec: ChunkSpec) {
    Object.keys(this.peers).forEach(peerId =>
      this.peers[peerId].request(chunkSpec)
    );
  }

  public clearChunkStore() {
    this.chunkStore = new ChunkStore(this.protocolOptions.liveDiscardWindow);
  }

  private onPeerSocket(peerSocket: Duplex, isInitiator: boolean) {
    const remotePeer = new RemotePeer(
      peerSocket,
      this.protocolOptions,
      this.chunkStore,
      this.privateKey
    );

    this.peers[remotePeer.peerId] = remotePeer;

    remotePeer.on("error", this.onPeerClose.bind(this, remotePeer.peerId));

    remotePeer.on("close", this.onPeerClose.bind(this, remotePeer.peerId));

    remotePeer.on("data", (message: DataMessage) => {
      if (this.chunkStore.getChunks(message.chunkSpec).length === 0) {
        this.chunkStore.setChunks(message.chunkSpec, [message.data]);

        this.chunkStore.discardOldChunks();

        this.emit("chunk", message.chunkSpec, message.data);
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
