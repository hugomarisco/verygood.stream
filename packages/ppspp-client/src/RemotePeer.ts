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
import randomBytes from "randombytes";
import { Logger } from "./Logger";
import { WebRTCSocket } from "./WebRTCSocket";

export class RemotePeer extends EventEmitter {
  public peerId: number;
  public socket: WebRTCSocket;
  public protocolOptions: ProtocolOptions;
  public chunkStore: Buffer[];
  public availability: BitSet;
  public isChoking: boolean;

  constructor(
    socket: WebRTCSocket,
    protocolOptions: ProtocolOptions,
    chunkStore: Buffer[]
  ) {
    super();

    this.peerId = randomBytes(4).readUInt32BE(0);

    this.isChoking = false;

    this.availability = new BitSet();

    this.chunkStore = chunkStore;

    this.protocolOptions = protocolOptions;

    this.socket = socket;

    this.socket.on("data", this.handleMessage.bind(this));
    this.socket.on("error", this.emit.bind(this, "error"));
  }

  public handshake(sourceChannel: number = 0) {
    this.socket.send(
      new HandshakeMessage(
        sourceChannel,
        this.protocolOptions,
        this.peerId
      ).encode()
    );

    Logger.debug("Handshake sent", { sourceChannel, peerId: this.peerId });
  }

  public have(chunkIndex: number) {
    this.socket.send(
      new HaveMessage(
        this.peerId,
        new ChunkSpec([chunkIndex, chunkIndex])
      ).encode()
    );
  }

  public request(chunkSpec: ChunkSpec) {
    this.socket.send(new RequestMessage(this.peerId, chunkSpec).encode());
  }

  public ack(chunkSpec: ChunkSpec, delay: PreciseTimestamp) {
    this.socket.send(new AckMessage(this.peerId, chunkSpec, delay).encode());
  }

  public data(chunkSpec: ChunkSpec, data: Buffer) {
    this.socket.send(
      new DataMessage(
        this.peerId,
        chunkSpec,
        new PreciseTimestamp(),
        data
      ).encode()
    );
  }

  private handleMessage(data: Buffer) {
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
    Logger.info("Handshake message received", { peerId: this.peerId });

    this.handshake(message.sourceChannel);
  }

  private handleHaveMessage(message: HaveMessage) {
    Logger.info("Have message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.set(begin, 1);

        if (!this.chunkStore[begin]) {
          this.request(message.chunkSpec);
        }

        break;
    }
  }

  private handleDataMessage(message: DataMessage) {
    Logger.info("Data message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        this.emit("dataMessage", message);

        this.ack(
          message.chunkSpec,
          new PreciseTimestamp().minus(message.timestamp)
        );

        break;
    }
  }

  private handleAckMessage(message: AckMessage) {
    Logger.info("Ack message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.set(begin, 1);

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
    Logger.info("Request message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        if (this.chunkStore[begin]) {
          this.data(new ChunkSpec([begin, begin]), this.chunkStore[begin]);
        }

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
