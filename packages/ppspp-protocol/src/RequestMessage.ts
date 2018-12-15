import { ChunkSpec } from "./ChunkSpec";
import { Message, MessageCode } from "./Message";

export class RequestMessage extends Message {
  private chunkSpec: ChunkSpec;

  constructor(
    destinationChannel: number,
    chunkSpec: ChunkSpec,
  ) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
  }

  public encode() {
    return super.encode(
      Buffer.concat([
        Buffer.from([MessageCode.REQUEST]),
        this.chunkSpec.encode(),
      ])
    );
  }
}
