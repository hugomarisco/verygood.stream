import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm
} from "@bitstreamy/commons";
import { ChunkSpec } from "./fields/ChunkSpec";
import { PreciseTimestamp } from "./fields/PreciseTimestamp";
import { ProtocolOptionCode, ProtocolOptions } from "./fields/ProtocolOptions";
import { AckMessage } from "./messages/AckMessage";
import { CancelMessage } from "./messages/CancelMessage";
import { ChokeMessage } from "./messages/ChokeMessage";
import { DataMessage } from "./messages/DataMessage";
import { HandshakeMessage } from "./messages/HandshakeMessage";
import { HaveMessage } from "./messages/HaveMessage";
import { IntegrityMessage } from "./messages/IntegrityMessage";
import { KeepAliveMessage } from "./messages/KeepAliveMessage";
import { Message } from "./messages/Message";
import { PexReqMessage } from "./messages/PexReqMessage";
import { PexResCertMessage } from "./messages/PexResCertMessage";
import { PexResV4Message } from "./messages/PexResV4Message";
import { PexResV6Message } from "./messages/PexResV6Message";
import { RequestMessage } from "./messages/RequestMessage";
import { SignedIntegrityMessage } from "./messages/SignedIntegrityMessage";
import { UnchokeMessage } from "./messages/UnchokeMessage";

export class Decoder {
  public static decode(
    buffer: Buffer,
    protocolOptions?: ProtocolOptions
  ): Message[] {
    let index = 0;
    const messages: Message[] = [];

    while (buffer.length > index) {
      const destinationChannel = buffer.readUInt32BE(index);
      index += 4;

      if (buffer.length === index) {
        messages.push(new KeepAliveMessage(destinationChannel));
        break;
      }

      const messageCode = buffer.readUInt8(index);
      index += 1;

      let chunkSpec!: ChunkSpec;

      if (
        messageCode === DataMessage.CODE ||
        messageCode === HaveMessage.CODE ||
        messageCode === AckMessage.CODE ||
        messageCode === IntegrityMessage.CODE ||
        messageCode === SignedIntegrityMessage.CODE ||
        messageCode === RequestMessage.CODE ||
        messageCode === CancelMessage.CODE
      ) {
        if (!protocolOptions) {
          throw new Error("Protocol options are not available");
        }

        chunkSpec = Decoder.chunkSpec(
          buffer.slice(index),
          protocolOptions.chunkAddressingMethod
        );

        index += chunkSpec.byteLength();
      }

      switch (messageCode) {
        case HandshakeMessage.CODE:
          const srcChannel = buffer.readUInt32BE(index);
          index += 4;

          let code: number;
          let version: number | undefined;
          let integrityProtectionMethod:
            | ContentIntegrityProtectionMethod
            | undefined;
          let chunkAddressingMethod: ChunkAddressingMethod | undefined;
          let liveDiscardWindow: number | undefined;
          let chunkSize: number | undefined;
          let minVersion: number | undefined;
          let liveSignatureAlgorithm: LiveSignatureAlgorithm | undefined;
          // let merkleHashFunction: MerkleHashFunction | undefined;
          let swarmId: Buffer | undefined;

          do {
            code = buffer.readUInt8(index);
            index += 1;

            switch (code) {
              case ProtocolOptionCode.VERSION:
                version = buffer.readUInt8(index);
                index += 1;
                break;
              case ProtocolOptionCode.MINIMUM_VERSION:
                minVersion = buffer.readUInt8(index);
                index += 1;
                break;
              case ProtocolOptionCode.SWARM_ID:
                const swarmIdLength = buffer.readUInt16BE(index);
                index += 2;

                swarmId = buffer.slice(index, index + swarmIdLength);

                index += swarmIdLength;
                break;
              case ProtocolOptionCode.INTEGRITY_PROTECTION_METHOD:
                integrityProtectionMethod = buffer.readUInt8(index);
                index += 1;
                break;
              // case ProtocolOptionCode.MERKLE_FUNCTION:
              //   merkleHashFunction = buffer.readUInt8(index);
              //   index += 1;
              //   break;
              case ProtocolOptionCode.LIVE_SIGNATURE_ALGORITHM:
                liveSignatureAlgorithm = buffer.readUInt8(index);
                index += 1;
                break;
              case ProtocolOptionCode.CHUNK_ADDRESSING:
                chunkAddressingMethod = buffer.readUInt8(index);
                index += 1;
                break;
              case ProtocolOptionCode.LIVE_DISCARD_WINDOW:
                liveDiscardWindow = buffer.readUInt32BE(index);
                index += 4;

                break;
              case ProtocolOptionCode.SUPPORTED_MESSAGES:
                const supportedMsgsLength = buffer.readUInt8(index);
                index += 1;

                // TODO

                index += supportedMsgsLength;
                break;
              case ProtocolOptionCode.CHUNK_SIZE:
                chunkSize = buffer.readUInt32BE(index);
                index += 4;
                break;
              case ProtocolOptionCode.END:
                break;
            }
          } while (code !== ProtocolOptionCode.END);

          if (
            version === undefined ||
            chunkAddressingMethod === undefined ||
            chunkSize === undefined ||
            integrityProtectionMethod === undefined ||
            liveDiscardWindow === undefined
          ) {
            throw new Error("Unable to find all the required protocol options");
          }

          protocolOptions = new ProtocolOptions(
            version,
            integrityProtectionMethod,
            chunkAddressingMethod,
            liveDiscardWindow,
            chunkSize,
            [],
            minVersion,
            swarmId,
            liveSignatureAlgorithm
            // merkleHashFunction,
          );

          messages.push(
            new HandshakeMessage(
              srcChannel,
              protocolOptions,
              destinationChannel
            )
          );

          break;
        case DataMessage.CODE:
          const timestamp = new PreciseTimestamp([
            buffer.readUInt32BE(index),
            buffer.readUInt32BE(index + 4)
          ]);
          index += 8;

          const data = buffer.slice(index);
          index += data.length;

          messages.push(
            new DataMessage(destinationChannel, chunkSpec, timestamp, data)
          );

          break;
        case AckMessage.CODE:
          const delay = new PreciseTimestamp([
            buffer.readUInt32BE(index),
            buffer.readUInt32BE(index + 4)
          ]);
          index += 8;

          messages.push(new AckMessage(destinationChannel, chunkSpec, delay));

          break;
        case HaveMessage.CODE:
          messages.push(new HaveMessage(destinationChannel, chunkSpec));

          break;
        /*case IntegrityMessage.CODE:
          if (!protocolOptions || !protocolOptions.merkleHashFunction) {
            throw new Error("Merkle hash function is not available");
          }

          const hash = Decoder.integrityHash(
            buffer,
            protocolOptions.merkleHashFunction
          );
          index += hash.length;

          messages.push(
            new IntegrityMessage(destinationChannel, chunkSpec, hash)
          );

          break;*/
        case PexResV4Message.CODE:
          const pexResV4Ip = buffer.readUInt32BE(index);
          index += 4;

          const pexResV4Port = buffer.readUInt16BE(index);
          index += 2;

          messages.push(
            new PexResV4Message(destinationChannel, pexResV4Ip, pexResV4Port)
          );
          break;
        case PexReqMessage.CODE:
          messages.push(new PexReqMessage(destinationChannel));
          break;
        case SignedIntegrityMessage.CODE:
          const liveSignatureTimestamp = new PreciseTimestamp([
            buffer.readUInt32BE(index),
            buffer.readUInt32BE(index + 4)
          ]);
          index += 8;

          if (!protocolOptions || !protocolOptions.swarmId) {
            throw new Error("Swarm ID is not available");
          }

          const modulusLength = protocolOptions.swarmId.components.n.length;

          const signature = buffer.slice(index, index + modulusLength);
          index += modulusLength;

          messages.push(
            new SignedIntegrityMessage(
              destinationChannel,
              chunkSpec,
              liveSignatureTimestamp,
              signature
            )
          );

          break;
        case RequestMessage.CODE:
          messages.push(new RequestMessage(destinationChannel, chunkSpec));

          break;
        case CancelMessage.CODE:
          messages.push(new CancelMessage(destinationChannel, chunkSpec));

          break;
        case ChokeMessage.CODE:
          messages.push(new ChokeMessage(destinationChannel));
          break;
        case UnchokeMessage.CODE:
          messages.push(new UnchokeMessage(destinationChannel));
          break;
        case PexResV6Message.CODE:
          const pexResV6Ip = buffer.slice(index, index + 16);
          index += 16;

          const pexResV6Port = buffer.readUInt16BE(index);
          index += 2;

          messages.push(
            new PexResV6Message(destinationChannel, pexResV6Ip, pexResV6Port)
          );

          break;
        case PexResCertMessage.CODE:
          const certLength = buffer.readUInt16BE(index);
          index += 2;

          const certificate = buffer.slice(index, index + certLength);
          index += certLength;

          messages.push(new PexResCertMessage(destinationChannel, certificate));

          break;
        default:
      }
    }

    return messages;
  }

  private static chunkSpec(
    buffer: Buffer,
    chunkAddressingMethod: ChunkAddressingMethod
  ): ChunkSpec {
    let chunkSpec: ChunkSpec;

    switch (chunkAddressingMethod) {
      /*case ChunkAddressingMethod["32BINs"]:
        chunkSpec = new ChunkSpec(buffer.readUInt32BE(0));
        break;*/
      case ChunkAddressingMethod["32ChunkRanges"]:
        chunkSpec = new ChunkSpec([
          buffer.readUInt32BE(0),
          buffer.readUInt32BE(4)
        ]);
        break;
      default:
        throw new Error("Invalid chunk addressing method");
    }

    return chunkSpec;
  }

  /*private static integrityHash(
    buffer: Buffer,
    merkleHashFunction: MerkleHashFunction
  ): Buffer {
    let bytes;

    switch (merkleHashFunction) {
      case MerkleHashFunction.SHA1:
        bytes = 20;
        break;
      case MerkleHashFunction.SHA224:
        bytes = 28;
        break;
      case MerkleHashFunction.SHA256:
        bytes = 32;
        break;
      case MerkleHashFunction.SHA384:
        bytes = 48;
        break;
      case MerkleHashFunction.SHA512:
        bytes = 64;
        break;
      default:
        throw new Error("Invalid merkle hash function");
    }

    return buffer.slice(0, bytes);
  }*/
}
