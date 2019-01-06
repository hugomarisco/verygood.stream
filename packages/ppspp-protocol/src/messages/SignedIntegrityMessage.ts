import { ChunkSpec } from "../fields/ChunkSpec";
import { PreciseTimestamp } from "../fields/PreciseTimestamp";
import { Message } from "./Message";

export class SignedIntegrityMessage extends Message {
  public static CODE = 0x07;

  public chunkSpec: ChunkSpec;
  public timestamp: PreciseTimestamp;
  public signature: Buffer;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
    timestamp: PreciseTimestamp,
    signature: Buffer,
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
    this.timestamp = timestamp;
    this.signature = signature;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([SignedIntegrityMessage.CODE]),
        this.chunkSpec.encode(),
        this.timestamp.encode(),
        this.signature,
      ])
    );
  }
}
