import { Message } from "./Message";

export class KeepAliveMessage extends Message {
  constructor(destinationChannel: number) {
    super(destinationChannel);
  }
}
