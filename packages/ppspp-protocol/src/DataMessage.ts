import { ChunkSpec } from "./ChunkSpec";
import { Message, MessageCode } from "./Message";
import { PreciseTimestamp } from "./PreciseTimestamp";

export class DataMessage extends Message {
  private chunkSpec: ChunkSpec;
  private timestamp: PreciseTimestamp;
  private data: Buffer;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
    timestamp: PreciseTimestamp,
    data: Buffer
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
    this.timestamp = timestamp;
    this.data = data;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([MessageCode.DATA]),
        this.chunkSpec.encode(),
        this.timestamp.encode(),
        this.data
      ])
    );
  }
}
