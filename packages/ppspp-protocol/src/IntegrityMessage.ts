import { ChunkSpec } from "./ChunkSpec";
import { Message, MessageCode } from "./Message";

export class IntegrityMessage extends Message {
  private chunkSpec: ChunkSpec;
  private hash: Buffer;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
    hash: Buffer,
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
    this.hash = hash;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([MessageCode.INTEGRITY]),
        this.chunkSpec.encode(),
        this.hash,
      ])
    );
  }
}
