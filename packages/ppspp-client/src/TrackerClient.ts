import EventEmitter from "events";
import URL, { UrlWithStringQuery } from "url";
import WebSocket from "ws";

export class TrackerClient extends EventEmitter {
  private url: UrlWithStringQuery;
  private socket?: WebSocket;

  constructor(url: string) {
    super();

    this.url = URL.parse(url);

    if (this.url.protocol !== "ws" && this.url.protocol !== "wss") {
      throw new Error(
        "The tracker must use websocket for the communication protocol"
      );
    }
  }

  public register() {
    this.socket = new WebSocket(this.url.toString());

    this.socket.on("message", this.handleMessage.bind(this));
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case "peers":
          this.emit("peers", message.peers);
          break;
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}
