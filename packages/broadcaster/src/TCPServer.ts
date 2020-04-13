import { Logger } from "@bitstreamy/commons";
import { EventEmitter } from "events";
import { Server, Socket } from "net";
import { MP4Parser } from "./MP4Parser";

const MAX_CHUNK_SIZE = 262528 - 528;

export class TCPServer extends EventEmitter {
  private server: Server;
  private mp4Parser: MP4Parser;
  private packetBuffer?: Buffer;
  private chunkIndex = 0;

  constructor(host: string, port: number) {
    super();

    this.mp4Parser = new MP4Parser();

    this.server = new Server();

    this.server.on("listening", this.onServerListening.bind(this));

    this.server.on("connection", this.onServerConnection.bind(this));

    this.server.listen(port, host);
  }

  private onServerListening() {
    Logger.debug("TCP server is listening", {
      address: this.server.address()
    });
  }

  private onServerConnection(socket: Socket) {
    this.packetBuffer = undefined;
    this.chunkIndex = 0;
    
    socket.pipe(this.mp4Parser).on("box", ({ type, data }) => {
      switch (type) {
        case "ftyp":
        case "moof":
          this.packetBuffer = data;
          break;
        case "moov":
          this.emit(
            "chunk",
            0xffffffff,
            Buffer.concat([this.packetBuffer, data])
          );

          break;
        case "mdat":
          this.emit(
            "chunk",
            this.chunkIndex,
            Buffer.concat([this.packetBuffer, data])
          );

          this.chunkIndex += 1;
          break;
      }
    });

    // socket.on("data", this.onSocketData.bind(this, socket));
    // socket.on("end", this.onSocketEnd.bind(this));
  }

  // private onSocketEnd() {
  //   if (this.buffer && this.buffer.length > 0) {
  //     this.emit(
  //       "chunk",
  //       this.bufferIndex,
  //       Buffer.from(this.buffer.slice(0, MAX_CHUNK_SIZE))
  //     );
  //   }

  //   this.emit("end");
  // }

  // private onSocketData(socket: Socket, data: Buffer) {
  //   socket.pause();

  //   console.log(data.length, data.length < MAX_CHUNK_SIZE);

  //   this.buffer = this.buffer ? Buffer.concat([this.buffer, data]) : data;

  //   if (this.buffer.length >= MAX_CHUNK_SIZE) {
  //     this.emit(
  //       "chunk",
  //       this.bufferIndex,
  //       Buffer.from(this.buffer.slice(0, MAX_CHUNK_SIZE))
  //     );

  //     this.bufferIndex += 1;

  //     this.buffer = Buffer.from(this.buffer.slice(MAX_CHUNK_SIZE));
  //   }

  //   socket.resume();
  // }
}
