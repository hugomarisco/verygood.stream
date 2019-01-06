import { Message } from "./Message";

export class UnchokeMessage extends Message {
  public static CODE = 0x0b;

  constructor(destinationChannel: number) {
    super(destinationChannel);
  }

  public encode() {
    return super.encode(Buffer.concat([Buffer.from([UnchokeMessage.CODE])]));
  }
}
