import dgram, { RemoteInfo, Socket } from "dgram";
import { EventEmitter } from "events";
import { Logger } from "./Logger";

export class UDPServer extends EventEmitter {
  private server: Socket;
  private chunkCount: number;

  constructor(host: string, port: number) {
    super();

    this.chunkCount = 0;

    this.server = dgram.createSocket("udp4");

    this.server.on("listening", this.onServerListening.bind(this));

    this.server.on("message", this.onServerMessage.bind(this));

    this.server.bind(port, host);
  }

  private onServerListening() {
    Logger.debug("UDP server is listening", { address: this.server.address() });
  }

  private onServerMessage(message: Buffer, remote: RemoteInfo) {
    // Logger.debug("Received UDP message", { data: message });

    this.emit("chunk", this.chunkCount, message);

    this.chunkCount += 1;
  }
}
