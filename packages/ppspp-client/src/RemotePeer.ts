import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  Logger
} from "@bitstreamy/commons";
import {
  AckMessage,
  ChokeMessage,
  ChunkSpec,
  DataMessage,
  Decoder,
  HandshakeMessage,
  HaveMessage,
  PreciseTimestamp,
  ProtocolOptions,
  RequestMessage,
  SignedIntegrityMessage,
  UnchokeMessage
} from "@bitstreamy/ppspp-protocol";
import { EventEmitter } from "events";
import BitSet from "fast-bitset";
import NodeRSA from "node-rsa";
import randomBytes from "randombytes";
import { Duplex } from "stream";
import { ChunkStore } from "./ChunkStore";

export class RemotePeer extends EventEmitter {
  public peerId: number;
  public isChoking: boolean;
  public availability: BitSet;
  private socket: Duplex;
  private protocolOptions: ProtocolOptions;
  private chunkStore: ChunkStore;
  private privateKey?: NodeRSA;
  private publicKey = new NodeRSA();

  constructor(
    socket: Duplex,
    protocolOptions: ProtocolOptions,
    chunkStore: ChunkStore,
    privateKey?: NodeRSA
  ) {
    super();

    this.peerId = randomBytes(4).readUInt32BE(0);

    this.isChoking = false;

    this.availability = new BitSet(1000);

    this.chunkStore = chunkStore;

    this.protocolOptions = protocolOptions;

    if (
      this.protocolOptions.integrityProtectionMethod ===
      ContentIntegrityProtectionMethod.SIGN_ALL
    ) {
      if (!this.protocolOptions.swarmId) {
        throw new Error("Invalid Swarm ID");
      }

      const { n, e } = this.protocolOptions.swarmId.components;

      this.publicKey.importKey({ n, e }, "components-public");
    }

    this.socket = socket;

    this.privateKey = privateKey;

    this.socket.on("data", this.handleMessage.bind(this));
    this.socket.on("error", this.emit.bind(this, "error"));
  }

  public handshake(destinationChannel?: number) {
    this.socket.write(
      new HandshakeMessage(
        this.peerId,
        this.protocolOptions,
        destinationChannel
      ).encode()
    );

    Logger.debug("Handshake sent", {
      destinationChannel,
      peerId: this.peerId
    });
  }

  public have(chunkSpec: ChunkSpec) {
    this.socket.write(new HaveMessage(this.peerId, chunkSpec).encode());
  }

  public request(chunkSpec: ChunkSpec) {
    this.socket.write(new RequestMessage(this.peerId, chunkSpec).encode());
  }

  private ack(chunkSpec: ChunkSpec, delay: PreciseTimestamp) {
    this.socket.write(new AckMessage(this.peerId, chunkSpec, delay).encode());
  }

  private data(chunkSpec: ChunkSpec, data: Buffer) {
    const buffers: Buffer[] = [];
    const timestamp: PreciseTimestamp = new PreciseTimestamp();

    let signature: Buffer;

    if (
      this.protocolOptions.integrityProtectionMethod ===
      ContentIntegrityProtectionMethod.SIGN_ALL
    ) {
      [signature] = this.chunkStore.getChunkSignatures(chunkSpec);

      if (!signature) {
        if (!this.privateKey) {
          this.emit("error", "Couldn't find a valid signature for the message");

          return;
        }

        signature = this.privateKey.sign(
          Buffer.concat([chunkSpec.encode(), timestamp.encode(), data])
        );
      }

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
      new DataMessage(this.peerId, chunkSpec, timestamp, data).encode()
    );

    this.socket.write(Buffer.concat(buffers));
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
        // case KeepAliveMessage:
        //   this.handleKeepAliveMessage(message as KeepAliveMessage);
        //   break;
        // case PexReqMessage:
        //   this.handlePexReqMessage(message as PexReqMessage);
        //   break;
        // case PexResV4Message:
        //   this.handlePexResV4Message(message as PexResV4Message);
        //   break;
        // case PexResV6Message:
        //   this.handlePexResV6Message(message as PexResV6Message);
        //   break;
        case ChokeMessage:
          this.handleChokeMessage();
          break;
        case UnchokeMessage:
          this.handleUnchokeMessage();
          break;
        // case IntegrityMessage:
        //   this.handleIntegrityMessage(message as IntegrityMessage);
        //   break;
        case SignedIntegrityMessage:
          this.handleSignedIntegrityMessage(message as SignedIntegrityMessage);
          break;
        case RequestMessage:
          this.handleRequestMessage(message as RequestMessage);
          break;
        // case CancelMessage:
        //   this.handleCancelMessage(message as CancelMessage);
        //   break;
        // case PexResCertMessage:
        //   this.handlePexResCertMessage(message as PexResCertMessage);
        //   break;
      }
    });
  }

  private handleHandshakeMessage(message: HandshakeMessage) {
    Logger.info("Handshake message received", {
      destinationChannel: message.destinationChannel,
      peerId: this.peerId
    });

    if (message.destinationChannel === 0) {
      this.handshake(message.sourceChannel);
    }
  }

  private handleHaveMessage(message: HaveMessage) {
    Logger.info("Have message received", {
      peerId: this.peerId
    });

    switch (this.protocolOptions.chunkAddressingMethod) {
      case ChunkAddressingMethod["32ChunkRanges"]:
        const [begin, end] = message.chunkSpec.spec as [number, number];

        this.availability.setRange(begin, end);

        if (this.chunkStore.getChunks(message.chunkSpec).length === 0) {
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
        // if (
        //   this.protocolOptions.integrityProtectionMethod ===
        //   ContentIntegrityProtectionMethod.SIGN_ALL
        // ) {
        //   const [signature] = this.chunkStore.getChunkSignatures(
        //     message.chunkSpec
        //   );

        //   if (signature) {
        //     try {
        //       if (
        //         !this.publicKey.verify(
        //           Buffer.concat([
        //             message.chunkSpec.encode(),
        //             message.timestamp.encode(),
        //             message.data
        //           ]),
        //           signature
        //         )
        //       ) {
        //         this.emit("error", new Error("Invalid signature found"));

        //         return;
        //       }
        //     } catch (err) {
        //       Logger.error(err);

        //       this.emit("error", new Error("Invalid signature found"));

        //       return;
        //     }
        //   } else {
        //     this.emit(
        //       "error",
        //       new Error("Couldn't find the signature for the message")
        //     );

        //     return;
        //   }
        // }

        this.ack(
          message.chunkSpec,
          new PreciseTimestamp().minus(message.timestamp)
        );

        this.emit("data", message);

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

  // private handleCancelMessage(message: CancelMessage) {
  //   // TODO
  // }

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
        const [chunkData] = this.chunkStore.getChunks(message.chunkSpec);

        if (chunkData) {
          this.data(message.chunkSpec, chunkData);
        }

        break;
    }
  }

  private handleSignedIntegrityMessage(message: SignedIntegrityMessage) {
    this.chunkStore.setChunkSignatures(message.chunkSpec, [message.signature]);
  }

  // private handleIntegrityMessage(message: IntegrityMessage) {
  //   // TODO
  // }

  // private handleKeepAliveMessage(message: KeepAliveMessage) {
  //   // TODO
  // }

  // private handlePexReqMessage(message: PexReqMessage) {
  //   // TODO
  // }

  // private handlePexResV4Message(message: PexResV4Message) {
  //   // TODO
  // }

  // private handlePexResV6Message(message: PexResV6Message) {
  //   // TODO
  // }

  // private handlePexResCertMessage(message: PexResCertMessage) {
  //   // TODO
  // }
}
