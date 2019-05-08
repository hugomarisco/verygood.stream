import { EventEmitter } from "events";
import { Server, Socket } from "net";
import { Logger } from "./Logger";
import { writeFileSync } from "fs";

export class TCPServer extends EventEmitter {
  private server: Server;
  private chunkIndex: number;
  private initSegment: Buffer[];

  constructor(host: string, port: number) {
    super();

    this.chunkIndex = 0;

    this.initSegment = [];

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
    this.chunkIndex = 0;
    this.initSegment = [];

    socket.on("data", this.onSocketData.bind(this));
    socket.on("end", this.emit.bind(this, "end"));
  }

  private onSocketData(data: Buffer) {
    Logger.debug("Received TCP message", { data: data.length });

    switch (this.chunkIndex) {
      case 0:
        this.initSegment.push(data);

        break;
      case 1:
        this.emit(
          "chunk",
          0xffffffff,
          Buffer.concat([...this.initSegment, data])
        );

        break;
      default:
        this.emit("chunk", this.chunkIndex, data);
    }

    this.chunkIndex += 1;
  }
}
