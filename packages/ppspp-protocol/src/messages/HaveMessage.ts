import { ChunkSpec } from "../fields/ChunkSpec";
import { Message } from "./Message";

export class HaveMessage extends Message {
  public static CODE = 0x03;

  public chunkSpec: ChunkSpec;

  constructor(destinationChannel: number, chunkSpec: ChunkSpec) {
    super(destinationChannel);

    this.chunkSpec = chunkSpec;
  }

  public encode() {
    return super.encode(
      Buffer.concat([Buffer.from([HaveMessage.CODE]), this.chunkSpec.encode()])
    );
  }
}
