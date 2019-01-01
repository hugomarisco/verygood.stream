import { MessageCode, ProtocolOptions } from "@verygood.stream/ppspp-protocol";
import { Duplex } from "stream";
import { RemotePeer } from "./RemotePeer";
import { SwarmMetadata } from "./SwarmMetadata";
import { SwarmTrackers } from "./SwarmTrackers";

export class Client extends Duplex {
  private static PROTOCOL_VERSION = 1;
  private static SUPPORTED_MESSAGES = [
    MessageCode.ACK,
    MessageCode.CANCEL,
    MessageCode.CHOKE,
    MessageCode.DATA,
    MessageCode.HANDSHAKE,
    MessageCode.HAVE,
    MessageCode.INTEGRITY,
    MessageCode.PEX_REQ,
    MessageCode.PEX_REScert,
    MessageCode.PEX_RESv4,
    MessageCode.PEX_RESv6,
    MessageCode.REQUEST,
    MessageCode.SIGNED_INTEGRITY,
    MessageCode.UNCHOKE
  ];

  private trackers: SwarmTrackers;
  private peers: RemotePeer[];
  private protocolOptions: ProtocolOptions;
  private chunkStore: Buffer[];

  constructor(swarmMetadata: SwarmMetadata, trackerUrls: string[]) {
    super();

    const {
      swarmId,
      chunkSize,
      chunkAddressingMethod,
      contentIntegrityProtectionMethod,
      merkleHashFunction,
      liveSignatureAlgorithm
    } = swarmMetadata;

    this.protocolOptions = new ProtocolOptions(
      Client.PROTOCOL_VERSION,
      contentIntegrityProtectionMethod,
      chunkAddressingMethod,
      1,
      chunkSize,
      Client.PROTOCOL_VERSION,
      liveSignatureAlgorithm,
      merkleHashFunction,
      swarmId,
      Client.SUPPORTED_MESSAGES
    );

    this.chunkStore = [];

    this.trackers = new SwarmTrackers(trackerUrls);

    this.trackers.on("peers", this.handleTrackerPeers.bind(this));

    this.peers = [];
  }

  public start() {
    this.trackers.register();
  }

  private handleTrackerPeers(offers: string[]) {
    offers.forEach(offer =>
      this.peers.push(
        new RemotePeer(offer, this.protocolOptions, this.chunkStore)
      )
    );
  }
}
