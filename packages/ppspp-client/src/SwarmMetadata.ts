import {
  ChunkAddressingMethodCode,
  ContentIntegrityProtectionMethodCode,
  MerkleHashFunctionCode,
  LiveSignatureAlgorithmCode
} from "@verygood.stream/ppspp-protocol";

export class SwarmMetadata {
  public swarmId: Buffer;
  public chunkSize: number;
  public chunkAddressingMethod: ChunkAddressingMethodCode;
  public contentIntegrityProtectionMethod: ContentIntegrityProtectionMethodCode;
  public merkleHashFunction?: MerkleHashFunctionCode;
  public liveSignatureAlgorithm?: LiveSignatureAlgorithmCode;

  constructor(
    swarmId: Buffer,
    chunkSize: number,
    chunkAddressingMethod: ChunkAddressingMethodCode,
    contentIntegrityProtectionMethod: ContentIntegrityProtectionMethodCode,
    merkleHashFunction?: MerkleHashFunctionCode,
    liveSignatureAlgorithm?: LiveSignatureAlgorithmCode
  ) {
    this.swarmId = swarmId;
    this.chunkSize = chunkSize;
    this.chunkAddressingMethod = chunkAddressingMethod;
    this.contentIntegrityProtectionMethod = contentIntegrityProtectionMethod;

    switch (contentIntegrityProtectionMethod) {
      case ContentIntegrityProtectionMethodCode.MERKLE_HASH_TREE:
      case ContentIntegrityProtectionMethodCode.UNIFIED_MERKLE_TREE:
        if (!merkleHashFunction) {
          throw new Error(
            "The merkle hash function is required when content integrity protection method is merkle tree"
          );
        }

        this.merkleHashFunction = merkleHashFunction;
        break;
      case ContentIntegrityProtectionMethodCode.SIGN_ALL:
        if (!liveSignatureAlgorithm) {
          throw new Error(
            "The live signature algorithm is required when content integrity protection method is sign-all"
          );
        }

        this.liveSignatureAlgorithm = liveSignatureAlgorithm;
        break;
    }
  }
}
