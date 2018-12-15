import { Message, MessageCode } from "./Message";

export class UnchokeMessage extends Message {
  constructor(destinationChannel: number) {
    super(destinationChannel);
  }

  public encode() {
    return super.encode(Buffer.concat([Buffer.from([MessageCode.UNCHOKE])]));
  }
}
