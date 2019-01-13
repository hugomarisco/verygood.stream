import {
  AckMessage,
  ProtocolOptions,
  DataMessage
} from "@verygood.stream/ppspp-protocol";
import { Duplex } from "stream";
import { RemotePeer } from "./RemotePeer";
import { SwarmMetadata } from "./SwarmMetadata";
import { SwarmTrackers } from "./SwarmTrackers";
import { WebRTCSocket } from "./WebRTCSocket";

export class Client extends Duplex {
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
      Client.PROTOCOL_VERSION,
      contentIntegrityProtectionMethod,
      chunkAddressingMethod,
      liveDiscardWindow,
      chunkSize,
      Client.SUPPORTED_MESSAGES,
      Client.PROTOCOL_VERSION,
      swarmId
      /*liveSignatureAlgorithm,
      merkleHashFunction,*/
    );

    this.chunkStore = [];

    this.trackers = new SwarmTrackers(trackerUrls);

    this.trackers.on("peerSocket", this.onPeerSocket.bind(this));

    this.peers = {};
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
