import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  LiveSignatureAlgorithm,
  MerkleHashFunction
} from "@verygood.stream/ppspp-protocol";

export class SwarmMetadata {
  public swarmId: Buffer;
  public chunkSize: number;
  public chunkAddressingMethod: ChunkAddressingMethod;
  public contentIntegrityProtectionMethod: ContentIntegrityProtectionMethod;
  public merkleHashFunction?: MerkleHashFunction;
  public liveSignatureAlgorithm?: LiveSignatureAlgorithm;

  constructor(
    swarmId: Buffer,
    chunkSize: number,
    chunkAddressingMethod: ChunkAddressingMethod,
    contentIntegrityProtectionMethod: ContentIntegrityProtectionMethod,
    merkleHashFunction?: MerkleHashFunction,
    liveSignatureAlgorithm?: LiveSignatureAlgorithm
  ) {
    this.swarmId = swarmId;
    this.chunkSize = chunkSize;
    this.chunkAddressingMethod = chunkAddressingMethod;
    this.contentIntegrityProtectionMethod = contentIntegrityProtectionMethod;

    /*switch (contentIntegrityProtectionMethod) {
      case ContentIntegrityProtectionMethod.MERKLE_HASH_TREE:
      case ContentIntegrityProtectionMethod.UNIFIED_MERKLE_TREE:
        if (!merkleHashFunction) {
          throw new Error(
            "The merkle hash function is required when content integrity protection method is merkle tree"
          );
        }

        this.merkleHashFunction = merkleHashFunction;
        break;
      case ContentIntegrityProtectionMethod.SIGN_ALL:
        if (!liveSignatureAlgorithm) {
          throw new Error(
            "The live signature algorithm is required when content integrity protection method is sign-all"
          );
        }

        this.liveSignatureAlgorithm = liveSignatureAlgorithm;
        break;
    }*/
  }
}
