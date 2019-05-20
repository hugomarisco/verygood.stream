export abstract class Message {
  public destinationChannel: number;
  private destinationChannelBuffer: Buffer;

  constructor(destinationChannel: number) {
    this.destinationChannel = destinationChannel;

    this.destinationChannelBuffer = Buffer.alloc(4);
    this.destinationChannelBuffer.writeUInt32BE(destinationChannel, 0);
  }

  protected encode(messageBuffer?: Buffer) {
    const buffers = [this.destinationChannelBuffer];

    if (messageBuffer) {
      buffers.push(messageBuffer);
    }

    return Buffer.concat(buffers);
  }
}
