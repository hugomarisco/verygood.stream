import { ChunkSpec } from "./ChunkSpec";
import { Message, MessageCode } from "./Message";

export class HaveMessage extends Message {
  public chunkSpec: ChunkSpec;

  constructor(destinationChannel: number, chunkSpec: ChunkSpec) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
  }

  public encode() {
    return super.encode(
      Buffer.concat([Buffer.from([MessageCode.HAVE]), this.chunkSpec.encode()])
    );
  }
}
