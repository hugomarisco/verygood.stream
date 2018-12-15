import {
  MessageCode,
} from "./Message";

export enum ProtocolOptionCode {
  CHUNK_ADDRESSING = 6,
  CHUNK_SIZE = 9,
  END = 255,
  INTEGRITY_PROTECTION_METHOD = 3,
  LIVE_DISCARD_WINDOW = 7,
  LIVE_SIGNATURE_ALGORITHM = 5,
  MERKLE_FUNCTION = 4,
  MINIMUM_VERSION = 1,
  SUPPORTED_MESSAGES = 8,
  SWARM_ID = 2,
  VERSION = 0,
};

export enum ChunkAddressingMethodCode {
  "32BINs" = 0,
  // "64ByteRanges" = 1,
  "32ChunkRanges" = 2
  // "64BINs" = 3,
  // "64ChunkRanges" = 4
};

export enum MerkleHashFunctionCode {
  SHA1 = 0,
  SHA224 = 1,
  SHA256 = 2,
  SHA384 = 3,
  SHA512 = 4
};

export enum LiveSignatureAlgorithmCode {
  ECDSAP256SHA256 = 13,
  ECDSAP384SHA384 = 14,
  RSASHA1 = 5,
  RSASHA256 = 8,
};

export enum ContentIntegrityProtectionMethodCode {
  NONE = 0,
  MERKLE_HASH_TREE = 1,
  SIGN_ALL = 2,
  UNIFIED_MERKLE_TREE = 3,
};

export class ProtocolOptions {
  public version: number;
  public minVersion?: number;
  public integrityProtectionMethod: ContentIntegrityProtectionMethodCode;
  public liveSignatureAlgorithm?: LiveSignatureAlgorithmCode;
  public liveDiscardWindow: number;
  public chunkAddressingMethod: ChunkAddressingMethodCode;
  public chunkSize: number;
  public merkleHashFunction?: MerkleHashFunctionCode;
  public swarmId?: Buffer;
  public supportedMessages?: MessageCode[];

  constructor(
    version: number,
    integrityProtectionMethod: ContentIntegrityProtectionMethodCode,
    chunkAddressingMethod: ChunkAddressingMethodCode,
    liveDiscardWindow: number,
    chunkSize: number,
    minVersion?: number,
    liveSignatureAlgorithm?: LiveSignatureAlgorithmCode,
    merkleHashFunction?: MerkleHashFunctionCode,
    swarmId?: Buffer,
    supportedMessages?: MessageCode[]
  ) {
    this.version = version;
    this.minVersion = minVersion;
    this.integrityProtectionMethod = integrityProtectionMethod;
    this.liveSignatureAlgorithm = liveSignatureAlgorithm;
    this.liveDiscardWindow = liveDiscardWindow;
    this.chunkAddressingMethod = chunkAddressingMethod;
    this.chunkSize = chunkSize;
    this.merkleHashFunction = merkleHashFunction;
    this.swarmId = swarmId;
    this.supportedMessages = supportedMessages;
  }

  public encode() {
    const buffers: Buffer[] = [];
    let tempBuffer: Buffer;

    // Version
    buffers.push(Buffer.from([ProtocolOptionCode.VERSION, this.version]));

    // Minimum version
    if (this.minVersion) {
      buffers.push(
        Buffer.from([ProtocolOptionCode.MINIMUM_VERSION, this.minVersion])
      );
    }

    // Swarm ID
    if (this.swarmId) {
      buffers.push(Buffer.from([ProtocolOptionCode.SWARM_ID]));

      Buffer.alloc(2).writeUInt16BE(this.swarmId.length, 0);

      buffers.push(this.swarmId);
    }

    // Integrity protection method
    buffers.push(
      Buffer.from([
        ProtocolOptionCode.INTEGRITY_PROTECTION_METHOD,
        this.integrityProtectionMethod
      ])
    );

    // Merkle Hash Function
    if (
      this.integrityProtectionMethod ===
      ContentIntegrityProtectionMethodCode.MERKLE_HASH_TREE
    ) {
      buffers.push(
        Buffer.from([
          ProtocolOptionCode.MERKLE_FUNCTION,
          this.merkleHashFunction
        ])
      );
    }

    // Live signature algorithm
    if (
      this.integrityProtectionMethod ===
        ContentIntegrityProtectionMethodCode.SIGN_ALL ||
      this.integrityProtectionMethod ===
        ContentIntegrityProtectionMethodCode.UNIFIED_MERKLE_TREE
    ) {
      buffers.push(
        Buffer.from([
          ProtocolOptionCode.LIVE_SIGNATURE_ALGORITHM,
          this.liveSignatureAlgorithm
        ])
      );
    }

    // Chunk Addressing Method
    buffers.push(
      Buffer.from([
        ProtocolOptionCode.CHUNK_ADDRESSING,
        this.chunkAddressingMethod
      ])
    );

    // Live Discard Window
    tempBuffer = Buffer.alloc(4);

    tempBuffer.writeUInt32BE(this.liveDiscardWindow, 0);

    buffers.push(
      Buffer.from([ProtocolOptionCode.LIVE_DISCARD_WINDOW, tempBuffer])
    );

    // TODO: Supported Messages

    // Chunk Size
    tempBuffer = Buffer.alloc(4);

    tempBuffer.writeUInt32BE(this.chunkSize, 0);

    buffers.push(
      Buffer.from([ProtocolOptionCode.CHUNK_SIZE, tempBuffer])
    );

    // End
    buffers.push(Buffer.from([ProtocolOptionCode.END]));

    return Buffer.concat(buffers);
  }
}
