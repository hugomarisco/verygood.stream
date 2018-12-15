import { ChunkSpec } from "./ChunkSpec";
import { Message, MessageCode } from "./Message";
import { PreciseTimestamp } from "./PreciseTimestamp";

export class AckMessage extends Message {
  private chunkSpec: ChunkSpec;
  private delay: PreciseTimestamp;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
    delay: PreciseTimestamp,
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
    this.delay = delay;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([MessageCode.ACK]),
        this.chunkSpec.encode(),
        this.delay.encode(),
      ])
    );
  }
}
