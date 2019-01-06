import { Message } from "./Message";

export class PexReqMessage extends Message {
  public static CODE = 0x06;

  constructor(destinationChannel: number) {
    super(destinationChannel);
  }

  public encode() {
    return super.encode(Buffer.concat([Buffer.from([PexReqMessage.CODE])]));
  }
}
