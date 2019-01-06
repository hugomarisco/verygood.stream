import { ChunkSpec } from "../fields/ChunkSpec";
import { PreciseTimestamp } from "../fields/PreciseTimestamp";
import { Message } from "./Message";

export class AckMessage extends Message {
  public static CODE = 0x02;

  public chunkSpec: ChunkSpec;
  public delay: PreciseTimestamp;

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
        Buffer.from([AckMessage.CODE]),
        this.chunkSpec.encode(),
        this.delay.encode(),
      ])
    );
  }
}
