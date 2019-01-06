import {
  AckMessage,
  CancelMessage,
  ChokeMessage,
  ChunkAddressingMethod,
  ChunkSpec,
  DataMessage,
  Decoder,
  HandshakeMessage,
  HaveMessage,
  IntegrityMessage,
  KeepAliveMessage,
  PexReqMessage,
  PexResCertMessage,
  PexResV4Message,
  PexResV6Message,
  PreciseTimestamp,
  ProtocolOptions,
  RequestMessage,
  SignedIntegrityMessage,
  UnchokeMessage
} from "@verygood.stream/ppspp-protocol";
import { BitSet } from "bitset";
import { EventEmitter } from "events";
import { range } from "lodash";
import randomBytes from "randombytes";
import WebRTCSocket from "simple-peer";

export class RemotePeer extends EventEmitter {
  private peerId: number;
  private socket: WebRTCSocket.Instance;
  private protocolOptions: ProtocolOptions;
  private chunkStore: Buffer[];
  private availability: BitSet;
  private isChoking: boolean;

  constructor(
    offer: string,
    protocolOptions: ProtocolOptions,
    chunkStore: Buffer[]
  ) {
    super();

    this.peerId = randomBytes(4).readUInt32BE(0);

    this.isChoking = false;

    this.availability = new BitSet();

    this.chunkStore = chunkStore;

    this.protocolOptions = protocolOptions;
    this.socket = new WebRTCSocket({ initiator: true });

    this.socket.signal(offer);

    this.socket.on("connect", this.handshake.bind(this));

    this.socket.on("data", this.handleData.bind(this));
  }

  public handshake(sourceChannel: number = 0) {
    this.socket.push(
      new HandshakeMessage(sourceChannel, this.peerId, this.protocolOptions)
    );
  }

  public request(chunkSpec: ChunkSpec) {
    this.socket.push(new RequestMessage(this.peerId, chunkSpec));
  }

  public ack(chunkSpec: ChunkSpec, delay: PreciseTimestamp) {
    this.socket.push(new AckMessage(this.peerId, chunkSpec, delay));
  }

  public data(chunkSpec: ChunkSpec, data: Buffer) {
    this.socket.push(
      new DataMessage(this.peerId, chunkSpec, new PreciseTimestamp(), data)
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
        case AckMessage:
          this.handleAckMessage(message as AckMessage);
          break;
        case KeepAliveMessage:
          this.handleKeepAliveMessage(message as KeepAliveMessage);
          break;
        case PexReqMessage:
          this.handlePexReqMessage(message as PexReqMessage);
          break;
        case PexResV4Message:
          this.handlePexResV4Message(message as PexResV4Message);
          break;
        case PexResV6Message:
          this.handlePexResV6Message(message as PexResV6Message);
          break;
        case ChokeMessage:
          this.handleChokeMessage(message as ChokeMessage);
          break;
        case UnchokeMessage:
          this.handleUnchokeMessage(message as UnchokeMessage);
          break;
        case IntegrityMessage:
          this.handleIntegrityMessage(message as IntegrityMessage);
          break;
        case SignedIntegrityMessage:
          this.handleSignedIntegrityMessage(message as SignedIntegrityMessage);
          break;
        case RequestMessage:
          this.handleRequestMessage(message as RequestMessage);
          break;
        case CancelMessage:
          this.handleCancelMessage(message as CancelMessage);
          break;
        case PexResCertMessage:
          this.handlePexResCertMessage(message as PexResCertMessage);
          break;
      }
    });
  }

  private handleHandshakeMessage(message: HandshakeMessage) {
    this.handshake(message.sourceChannel);
  }

  private handleHaveMessage(message: HaveMessage) {
    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.setRange(begin, end, 1);

        let requestStart = begin;

        range(begin, end).forEach((chunkNumber, index, arr) => {
          if (!this.chunkStore[chunkNumber]) {
            this.request(new ChunkSpec([requestStart, chunkNumber - 1]));

            requestStart = chunkNumber + 1;
          } else if (arr.length === index + 1) {
            this.request(new ChunkSpec([requestStart, chunkNumber]));
          }
        });

        break;
    }
  }

  private handleDataMessage(message: DataMessage) {
    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
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

        this.ack(
          message.chunkSpec,
          message.timestamp.minus(new PreciseTimestamp())
        );

        break;
    }
  }

  private handleAckMessage(message: AckMessage) {
    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.setRange(begin, end, 1);

        break;
    }
  }

  private handleCancelMessage(message: CancelMessage) {
    // TODO
  }

  private handleChokeMessage(message: ChokeMessage) {
    this.isChoking = true;
  }

  private handleUnchokeMessage(message: UnchokeMessage) {
    this.isChoking = false;
  }

  private handleRequestMessage(message: RequestMessage) {
    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        range(begin, end).forEach(chunkIndex => {
          if (this.chunkStore[chunkIndex]) {
            this.data(new ChunkSpec(chunkIndex), this.chunkStore[chunkIndex]);
          }
        });

        break;
    }
  }

  private handleSignedIntegrityMessage(message: SignedIntegrityMessage) {
    // TODO
  }

  private handleIntegrityMessage(message: IntegrityMessage) {
    // TODO
  }

  private handleKeepAliveMessage(message: KeepAliveMessage) {
    // TODO
  }

  private handlePexReqMessage(message: PexReqMessage) {
    // TODO
  }

  private handlePexResV4Message(message: PexResV4Message) {
    // TODO
  }

  private handlePexResV6Message(message: PexResV6Message) {
    // TODO
  }

  private handlePexResCertMessage(message: PexResCertMessage) {
    // TODO
  }
}
