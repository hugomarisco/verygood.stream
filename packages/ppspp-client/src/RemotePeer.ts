import {
  AckMessage,
  CancelMessage,
  ChokeMessage,
  ChunkAddressingMethod,
  ChunkSpec,
  ContentIntegrityProtectionMethod,
  DataMessage,
  Decoder,
  HandshakeMessage,
  HaveMessage,
  IntegrityMessage,
  KeepAliveMessage,
  LiveSignatureAlgorithm,
  PexReqMessage,
  PexResCertMessage,
  PexResV4Message,
  PexResV6Message,
  PreciseTimestamp,
  ProtocolOptions,
  RequestMessage,
  SignedIntegrityMessage,
  UnchokeMessage
} from "@bitstreamy/ppspp-protocol";
import { EventEmitter } from "events";
import BitSet from "fast-bitset";
import { md, util } from "node-forge";
import randomBytes from "randombytes";
import { ChunkStore } from "./ChunkStore";
import { Logger } from "./Logger";
import { WebRTCSocket } from "./WebRTCSocket";

export class RemotePeer extends EventEmitter {
  public peerId: number;
  public socket: WebRTCSocket;
  public protocolOptions: ProtocolOptions;
  public chunkStore: ChunkStore;
  public availability: BitSet;
  public isChoking: boolean;
  private privateKey?: any;
  private lastSignedIntegrityMessage?: SignedIntegrityMessage;

  constructor(
    socket: WebRTCSocket,
    protocolOptions: ProtocolOptions,
    chunkStore: ChunkStore,
    privateKey?: any
  ) {
    super();

    this.peerId = randomBytes(4).readUInt32BE(0);

    this.isChoking = false;

    this.availability = new BitSet(1000);

    this.chunkStore = chunkStore;

    this.protocolOptions = protocolOptions;

    this.socket = socket;

    this.privateKey = privateKey;

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

    Logger.debug("Handshake sent", {
      peerId: this.peerId,
      sourceChannel
    });
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
    const buffers: Buffer[] = [];
    const timestamp: PreciseTimestamp = new PreciseTimestamp();

    if (
      this.protocolOptions.integrityProtectionMethod ===
      ContentIntegrityProtectionMethod.SIGN_ALL
    ) {
      if (!this.privateKey) {
        this.emit("error", new Error("Private Key is not set"));
        return;
      }

      let messageDigest: any;

      switch (this.protocolOptions.liveSignatureAlgorithm) {
        case LiveSignatureAlgorithm.RSASHA1:
          messageDigest = md.sha1.create();

          break;
        case LiveSignatureAlgorithm.RSASHA256:
          messageDigest = md.sha256.create();

          break;
        default:
          this.emit("error", new Error("Invalid Live Signature Algorithm"));

          return;
      }

      messageDigest.update(
        Buffer.concat([chunkSpec.encode(), timestamp.encode(), data])
      );

      const signature = Buffer.from(
        util.binary.raw.decode(this.privateKey.sign(md))
      );

      buffers.push(
        new SignedIntegrityMessage(
          this.peerId,
          chunkSpec,
          timestamp,
          signature
        ).encode()
      );
    }

    buffers.push(
      new DataMessage(
        this.peerId,
        chunkSpec,
        new PreciseTimestamp(),
        data
      ).encode()
    );

    this.socket.send(Buffer.concat(buffers));
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
          this.handleChokeMessage();
          break;
        case UnchokeMessage:
          this.handleUnchokeMessage();
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
    Logger.info("Handshake message received", {
      peerId: this.peerId
    });

    this.handshake(message.sourceChannel);
  }

  private handleHaveMessage(message: HaveMessage) {
    Logger.info("Have message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.setRange(begin, end);

        if (!this.chunkStore.getChunk(begin)) {
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
        if (
          this.protocolOptions.integrityProtectionMethod ===
          ContentIntegrityProtectionMethod.SIGN_ALL
        ) {
          if (this.lastSignedIntegrityMessage) {
            let messageDigest: any;

            switch (this.protocolOptions.liveSignatureAlgorithm) {
              case LiveSignatureAlgorithm.RSASHA1:
                messageDigest = md.sha1.create();

                break;
              case LiveSignatureAlgorithm.RSASHA256:
                messageDigest = md.sha256.create();

                break;
              default:
                this.emit(
                  "error",
                  new Error("Invalid Live Signature Algorithm")
                );

                return;
            }

            messageDigest.update(
              Buffer.concat([
                message.chunkSpec.encode(),
                message.timestamp.encode(),
                message.data
              ])
            );

            if (
              !this.privateKey.verify(
                messageDigest.digest().bytes(),
                this.lastSignedIntegrityMessage.signature
              )
            ) {
              this.emit("error", new Error("Invalid signature found"));

              return;
            }
          } else {
            this.emit(
              "error",
              new Error("Couldn't find the last Signed Integrity message")
            );

            return;
          }
        }

        this.emit("dataMessage", message);

        this.ack(message.chunkSpec, new PreciseTimestamp([1, 1]));

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

        this.availability.setRange(begin, end);

        break;
    }
  }

  private handleCancelMessage(message: CancelMessage) {
    // TODO
  }

  private handleChokeMessage() {
    this.isChoking = true;
  }

  private handleUnchokeMessage() {
    this.isChoking = false;
  }

  private handleRequestMessage(message: RequestMessage) {
    Logger.info("Request message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [chunkIndex] = message.chunkSpec.spec as [number, number];

        const chunkData = this.chunkStore.getChunk(chunkIndex);

        if (chunkData) {
          this.data(new ChunkSpec([chunkIndex, chunkIndex]), chunkData);
        }

        break;
    }
  }

  private handleSignedIntegrityMessage(message: SignedIntegrityMessage) {
    this.lastSignedIntegrityMessage = message;
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
