import {
  ChunkAddressingMethodCode,
  DataMessage,
  Decoder,
  HandshakeMessage,
  HaveMessage,
  ProtocolOptions
} from "@verygood.stream/ppspp-protocol";
import { BitSet } from "bitset";
import { EventEmitter } from "events";
import randomBytes from "randombytes";
import WebRTCSocket from "simple-peer";

export class RemotePeer extends EventEmitter {
  private peerId: number;
  private socket: WebRTCSocket.Instance;
  private protocolOptions: ProtocolOptions;
  private chunkStore: Buffer[];
  private availability: BitSet;

  constructor(
    offer: string,
    protocolOptions: ProtocolOptions,
    chunkStore: Buffer[]
  ) {
    super();

    this.peerId = randomBytes(4).readUInt32BE(0);

    this.availability = new BitSet();

    this.chunkStore = chunkStore;

    this.protocolOptions = protocolOptions;
    this.socket = new WebRTCSocket({ initiator: true });

    this.socket.signal(offer);

    this.socket.on("connect", this.handshake.bind(this));

    this.socket.on("data", this.handleData.bind(this));
  }

  public handshake() {
    this.socket.push(
      new HandshakeMessage(0, this.peerId, this.protocolOptions)
    );
  }

  private handleData(data: Buffer) {
    const messages = Decoder.decode(data, this.protocolOptions);

    messages.forEach(message => {
      switch (message.constructor) {
        case HandshakeMessage:
          this.handleHandshakeMessage(message as HandshakeMessage);
          break;
        case HaveMessage:
          this.handleHaveMessage(message as HaveMessage);
          break;
        case DataMessage:
          this.handleDataMessage(message as DataMessage);
          break;
      }
    });
  }

  private handleHandshakeMessage(message: HandshakeMessage) {
    this.socket.push(
      new HandshakeMessage(
        message.sourceChannel,
        this.peerId,
        this.protocolOptions
      )
    );
  }

  private handleHaveMessage(message: HaveMessage) {
    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethodCode["32BINs"]:
        this.availability.set(message.chunkSpec.spec as number);
        break;
      case ChunkAddressingMethodCode["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.setRange(begin, end, 1);
        break;
    }
  }

  private handleDataMessage(message: DataMessage) {
    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethodCode["32BINs"]:
        break;
      case ChunkAddressingMethodCode["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        const chunks: Buffer[] = [];

        for (let index = begin; index < end; index++) {
          chunks.push(
            message.data.slice(
              index * this.protocolOptions.chunkSize,
              (index + 1) * this.protocolOptions.chunkSize
            )
          );
        }

        this.chunkStore.splice.apply(null, [begin, 0, ...chunks]);

        break;
    }
  }
}
