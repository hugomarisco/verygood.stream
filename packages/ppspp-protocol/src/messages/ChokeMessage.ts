import { Message } from "./Message";

export class ChokeMessage extends Message {
  public static CODE = 0x0a;

  constructor(destinationChannel: number) {
    super(destinationChannel);
  }

  public encode() {
    return super.encode(Buffer.concat([Buffer.from([ChokeMessage.CODE])]));
  }
}
