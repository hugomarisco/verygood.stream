import { ChunkSpec } from "./ChunkSpec";
import { Message, MessageCode } from "./Message";
import { PreciseTimestamp } from "./PreciseTimestamp";

export class SignedIntegrityMessage extends Message {
  private chunkSpec: ChunkSpec;
  private timestamp: PreciseTimestamp;
  private signature: Buffer;

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
        Buffer.from([MessageCode.SIGNED_INTEGRITY]),
        this.chunkSpec.encode(),
        this.timestamp.encode(),
        this.signature,
      ])
    );
  }
}
