import { AckMessage } from "./AckMessage";
import { CancelMessage } from "./CancelMessage";
import { ChokeMessage } from "./ChokeMessage";
import { ChunkSpec } from "./ChunkSpec";
import { DataMessage } from "./DataMessage";
import { HandshakeMessage } from "./HandshakeMessage";
import { HaveMessage } from "./HaveMessage";
import { IntegrityMessage } from "./IntegrityMessage";
import { KeepAliveMessage } from "./KeepAliveMessage";
import { Message, MessageCode } from "./Message";
import { PexReqMessage } from "./PexReqMessage";
import { PexResCertMessage } from "./PexResCertMessage";
import { PexResV4Message } from "./PexResV4Message";
import { PexResV6Message } from "./PexResV6Message";
import { PreciseTimestamp } from "./PreciseTimestamp";
import {
  ChunkAddressingMethodCode,
  ContentIntegrityProtectionMethodCode,
  LiveSignatureAlgorithmCode,
  MerkleHashFunctionCode,
  ProtocolOptionCode,
  ProtocolOptions
} from "./ProtocolOptions";
import { RequestMessage } from "./RequestMessage";
import { SignedIntegrityMessage } from "./SignedIntegrityMessage";
import { UnchokeMessage } from "./UnchokeMessage";

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
        messageCode === MessageCode.DATA ||
        messageCode === MessageCode.HAVE ||
        messageCode === MessageCode.ACK ||
        messageCode === MessageCode.INTEGRITY ||
        messageCode === MessageCode.SIGNED_INTEGRITY ||
        messageCode === MessageCode.REQUEST ||
        messageCode === MessageCode.CANCEL
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
        case MessageCode.HANDSHAKE:
          const srcChannel = buffer.readUInt32BE(index);
          index += 4;

          let code: number;
          let version: number | undefined;
          let integrityProtectionMethod:
            | ContentIntegrityProtectionMethodCode
            | undefined;
          let chunkAddressingMethod: ChunkAddressingMethodCode | undefined;
          let liveDiscardWindow: number | undefined;
          let chunkSize: number | undefined;
          let minVersion: number | undefined;
          let liveSignatureAlgorithm: LiveSignatureAlgorithmCode | undefined;
          let merkleHashFunction: MerkleHashFunctionCode | undefined;
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
              case ProtocolOptionCode.MERKLE_FUNCTION:
                merkleHashFunction = buffer.readUInt8(index);
                index += 1;
                break;
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
            !version ||
            !integrityProtectionMethod ||
            !chunkAddressingMethod ||
            !liveDiscardWindow ||
            !chunkSize
          ) {
            throw new Error("Unable to find all the required protocol options");
          }

          protocolOptions = new ProtocolOptions(
            version,
            integrityProtectionMethod,
            chunkAddressingMethod,
            liveDiscardWindow,
            chunkSize,
            minVersion,
            liveSignatureAlgorithm,
            merkleHashFunction,
            swarmId
          );

          messages.push(
            new HandshakeMessage(
              destinationChannel,
              srcChannel,
              protocolOptions
            )
          );

          break;
        case MessageCode.DATA:
          const timestamp = new PreciseTimestamp(
            buffer.readUInt32BE(0),
            buffer.readUInt32BE(4)
          );
          index += 8;

          if (!protocolOptions) {
            throw new Error("Protocol options are not available");
          }

          const data = buffer.slice(index, index + protocolOptions.chunkSize);
          index += protocolOptions.chunkSize;

          messages.push(
            new DataMessage(destinationChannel, chunkSpec, timestamp, data)
          );

          break;
        case MessageCode.ACK:
          const delay = new PreciseTimestamp(
            buffer.readUInt32BE(0),
            buffer.readUInt32BE(4)
          );
          index += 8;

          messages.push(new AckMessage(destinationChannel, chunkSpec, delay));

          break;
        case MessageCode.HAVE:
          messages.push(new HaveMessage(destinationChannel, chunkSpec));

          break;
        case MessageCode.INTEGRITY:
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

          break;
        case MessageCode.PEX_RESv4:
          const pexResV4Ip = buffer.readUInt32BE(index);
          index += 4;

          const pexResV4Port = buffer.readUInt16BE(index);
          index += 2;

          messages.push(
            new PexResV4Message(destinationChannel, pexResV4Ip, pexResV4Port)
          );
          break;
        case MessageCode.PEX_REQ:
          messages.push(new PexReqMessage(destinationChannel));
          break;
        case MessageCode.SIGNED_INTEGRITY:
          const liveSignatureTimestamp = new PreciseTimestamp(
            buffer.readUInt32BE(0),
            buffer.readUInt32BE(4)
          );
          index += 8;

          let liveSignatureByteLength: number;

          if (!protocolOptions || !protocolOptions.swarmId) {
            throw new Error("Swarm ID is not available");
          }

          switch (protocolOptions.liveSignatureAlgorithm) {
            case LiveSignatureAlgorithmCode.RSASHA1:
            case LiveSignatureAlgorithmCode.RSASHA256:
              liveSignatureByteLength = protocolOptions.swarmId.readUInt8(
                index
              );

              if (liveSignatureByteLength === 0) {
                liveSignatureByteLength = protocolOptions.swarmId.readUInt32BE(
                  2
                );
              }
              break;
            case LiveSignatureAlgorithmCode.ECDSAP256SHA256:
              liveSignatureByteLength = 64;
              break;
            case LiveSignatureAlgorithmCode.ECDSAP384SHA384:
              liveSignatureByteLength = 96;
              break;
            default:
              throw new Error("Invalid Live Signature Algorithm");
          }

          const liveSignature = buffer.slice(
            index,
            index + liveSignatureByteLength
          );
          index += liveSignatureByteLength;

          messages.push(
            new SignedIntegrityMessage(
              destinationChannel,
              chunkSpec,
              liveSignatureTimestamp,
              liveSignature
            )
          );

          break;
        case MessageCode.REQUEST:
          messages.push(new RequestMessage(destinationChannel, chunkSpec));

          break;
        case MessageCode.CANCEL:
          messages.push(new CancelMessage(destinationChannel, chunkSpec));

          break;
        case MessageCode.CHOKE:
          messages.push(new ChokeMessage(destinationChannel));
          break;
        case MessageCode.UNCHOKE:
          messages.push(new UnchokeMessage(destinationChannel));
          break;
        case MessageCode.PEX_RESv6:
          const pexResV6Ip = buffer.slice(index, index + 16);
          index += 16;

          const pexResV6Port = buffer.readUInt16BE(index);
          index += 2;

          messages.push(
            new PexResV6Message(destinationChannel, pexResV6Ip, pexResV6Port)
          );

          break;
        case MessageCode.PEX_REScert:
          const certLength = buffer.readUInt16BE(index);
          index += 2;

          const certificate = buffer.slice(index, index + certLength);
          index += certLength;

          messages.push(new PexResCertMessage(destinationChannel, certificate));

          break;
        default:
          messages.push(new KeepAliveMessage(destinationChannel));
      }
    }

    return messages;
  }

  private static chunkSpec(
    buffer: Buffer,
    chunkAddressingMethod: ChunkAddressingMethodCode
  ): ChunkSpec {
    let chunkSpec: ChunkSpec;

    switch (chunkAddressingMethod) {
      case ChunkAddressingMethodCode["32BINs"]:
        chunkSpec = new ChunkSpec(buffer.readUInt32BE(0));
        break;
      case ChunkAddressingMethodCode["32ChunkRanges"]:
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

  private static integrityHash(
    buffer: Buffer,
    merkleHashFunction: MerkleHashFunctionCode
  ): Buffer {
    let bytes;

    switch (merkleHashFunction) {
      case MerkleHashFunctionCode.SHA1:
        bytes = 20;
        break;
      case MerkleHashFunctionCode.SHA224:
        bytes = 28;
        break;
      case MerkleHashFunctionCode.SHA256:
        bytes = 32;
        break;
      case MerkleHashFunctionCode.SHA384:
        bytes = 48;
        break;
      case MerkleHashFunctionCode.SHA512:
        bytes = 64;
        break;
      default:
        throw new Error("Invalid merkle hash function");
    }

    return buffer.slice(0, bytes);
  }
}
