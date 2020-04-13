import { Duplex } from "stream";

export class MP4Parser extends Duplex {
  private buffer?: Buffer;

  public _write(chunk: Buffer, encoding: string, cb: (err?: Error) => void) {
    this.buffer = this.buffer ? Buffer.concat([this.buffer, chunk]) : chunk;

    const { size, type } = this.getSizeAndType(this.buffer);

    if (this.buffer.length >= size) {
      const box = Buffer.from(this.buffer.slice(0, size));

      this.emit("box", { type, data: box });

      this.push(box);

      this.buffer = Buffer.from(this.buffer.slice(size));
    }

    cb();
  }

  public _read() {}

  private getSizeAndType(buffer: Buffer) {
    let index = 0;

    const size = buffer.readUInt32BE(index);
    index += 4;

    const type = buffer.toString("ascii", index, index + 4);
    index += 4;

    return { size, type };
  }
}
