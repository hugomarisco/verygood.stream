export enum MessageCode {
  ACK = 0x02,
  CANCEL = 0x09,
  CHOKE = 0x0a,
  DATA = 0x01,
  HANDSHAKE = 0x00,
  HAVE = 0x03,
  INTEGRITY = 0x04,
  PEX_REQ = 0x06,
  PEX_REScert = 0x0d,
  PEX_RESv4 = 0x05,
  PEX_RESv6 = 0x0c,
  REQUEST = 0x08,
  SIGNED_INTEGRITY = 0x07,
  UNCHOKE = 0x0b,
};

export abstract class Message {
  private destinationChannelBuffer: Buffer;

  constructor(destinationChannel: number) {
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