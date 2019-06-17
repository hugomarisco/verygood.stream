import {
  escape as base64UrlEscape,
  unescape as base64UrlUnescape
} from "base64-url";

export enum ChunkAddressingMethod {
  // "32BINs" = 0,
  // "64ByteRanges" = 1,
  "32ChunkRanges" = 2
  // "64BINs" = 3,
  // "64ChunkRanges" = 4
}

// export enum MerkleHashFunction {
//   SHA1 = 0,
//   SHA224 = 1,
//   SHA256 = 2,
//   SHA384 = 3,
//   SHA512 = 4
// }

export enum LiveSignatureAlgorithm {
  // ECDSAP256SHA256 = 13,
  // ECDSAP384SHA384 = 14,
  RSASHA1 = 5,
  RSASHA256 = 8
}

export enum ContentIntegrityProtectionMethod {
  NONE = 0,
  // MERKLE_HASH_TREE = 1,
  SIGN_ALL = 2
  // UNIFIED_MERKLE_TREE = 3
}

export class SwarmMetadata {
  public static fromSearchParams(searchParams: URLSearchParams) {
    const swarmId = searchParams.get("swarmId");

    if (!swarmId) {
      throw new Error("Swarm ID was not found in URL");
    }

    const chunkSize = searchParams.get("chunkSize");
    const chunkAddressingMethod = searchParams.get("chunkAddressingMethod");
    const contentIntegrityProtectionMethod = searchParams.get(
      "contentIntegrityProtectionMethod"
    );
    // const merkleHashFunction = searchParams.get("merkleHashFunction");
    const liveSignatureAlgorithm = searchParams.get("liveSignatureAlgorithm");

    return new SwarmMetadata(
      Buffer.from(base64UrlUnescape(swarmId), "base64"),
      chunkSize ? parseInt(chunkSize, 10) : 0xffffffff,
      chunkAddressingMethod
        ? parseInt(chunkAddressingMethod, 10)
        : ChunkAddressingMethod["32ChunkRanges"],
      contentIntegrityProtectionMethod
        ? parseInt(contentIntegrityProtectionMethod, 10)
        : ContentIntegrityProtectionMethod.SIGN_ALL,
      // merkleHashFunction,
      liveSignatureAlgorithm ? parseInt(liveSignatureAlgorithm, 10) : undefined
    );
  }

  public swarmId: Buffer;
  public chunkSize: number;
  public chunkAddressingMethod: ChunkAddressingMethod;
  public contentIntegrityProtectionMethod: ContentIntegrityProtectionMethod;
  // public merkleHashFunction?: MerkleHashFunction;
  public liveSignatureAlgorithm?: LiveSignatureAlgorithm;

  constructor(
    swarmId: Buffer,
    chunkSize: number,
    chunkAddressingMethod: ChunkAddressingMethod,
    contentIntegrityProtectionMethod: ContentIntegrityProtectionMethod,
    // merkleHashFunction?: MerkleHashFunction,
    liveSignatureAlgorithm?: LiveSignatureAlgorithm
  ) {
    this.swarmId = swarmId;
    this.chunkSize = chunkSize;
    this.chunkAddressingMethod = chunkAddressingMethod;
    this.contentIntegrityProtectionMethod = contentIntegrityProtectionMethod;

    switch (contentIntegrityProtectionMethod) {
      // case ContentIntegrityProtectionMethod.MERKLE_HASH_TREE:
      // case ContentIntegrityProtectionMethod.UNIFIED_MERKLE_TREE:
      //   if (!merkleHashFunction) {
      //     throw new Error(
      //       "The merkle hash function is required when content integrity protection method is merkle tree"
      //     );
      //   }

      //   this.merkleHashFunction = merkleHashFunction;
      //   break;
      case ContentIntegrityProtectionMethod.SIGN_ALL:
        if (!liveSignatureAlgorithm) {
          throw new Error(
            "The live signature algorithm is required when content integrity protection method is sign-all"
          );
        }

        this.liveSignatureAlgorithm = liveSignatureAlgorithm;
        break;
    }
  }

  public toSearchParams() {
    const searchParams = new URLSearchParams();

    searchParams.append(
      "swarmId",
      base64UrlEscape(this.swarmId.toString("base64"))
    );

    searchParams.append(
      "chunkAddressingMethod",
      this.chunkAddressingMethod.toString()
    );

    searchParams.append(
      "contentIntegrityProtectionMethod",
      this.contentIntegrityProtectionMethod.toString()
    );

    // searchParams.append(
    //   "merkleHashFunction",
    //   this.merkleHashFunction.toString()
    // );

    if (this.liveSignatureAlgorithm) {
      searchParams.append(
        "liveSignatureAlgorithm",
        this.liveSignatureAlgorithm.toString()
      );
    }

    return searchParams;
  }
}
