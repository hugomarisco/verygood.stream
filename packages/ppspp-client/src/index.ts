import {
  AckMessage,
  DataMessage,
  ProtocolOptions
} from "@verygood.stream/ppspp-protocol";
import { Duplex } from "stream";
import { RemotePeer } from "./RemotePeer";
import { SwarmMetadata } from "./SwarmMetadata";
import { SwarmTrackers } from "./SwarmTrackers";
import { WebRTCSocket } from "./WebRTCSocket";

export const ClientSwarmMetadata = SwarmMetadata;

export class PPSPPClient extends Duplex {
  private static PROTOCOL_VERSION = 1;
  private static SUPPORTED_MESSAGES = [AckMessage.CODE];

  private trackers: SwarmTrackers;
  private peers: { [peerId: string]: RemotePeer };
  private protocolOptions: ProtocolOptions;
  private chunkStore: Buffer[];

  constructor(
    swarmMetadata: SwarmMetadata,
    { liveDiscardWindow = 10 },
    trackerUrls: string[]
  ) {
    super();

    const {
      swarmId,
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod
      /*merkleHashFunction,
      liveSignatureAlgorithm*/
    } = swarmMetadata;

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

    this.trackers = new SwarmTrackers(trackerUrls, swarmId);

    this.trackers.on("peerSocket", this.onPeerSocket.bind(this));

    this.peers = {};
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

    remotePeer.on("dataMessage", (message: DataMessage) => {
      const [chunkIndex] = message.chunkSpec.spec as [number, number];

      if (!this.chunkStore[chunkIndex]) {
        this.chunkStore[chunkIndex] = message.data;
        this.emit.bind(null, "chunk");
      }
    });
  }
}
