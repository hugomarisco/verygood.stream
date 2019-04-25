import { EventEmitter } from "events";
import { v4 as UUIDv4 } from "uuid";
import WebSocket from "ws";
import { Logger } from "./Logger";

export class Peer extends EventEmitter {
  public peerId: string;
  private ws: WebSocket;
  private offers: string[];

  constructor(ws: WebSocket) {
    super();

    this.peerId = UUIDv4();
    this.ws = ws;
    this.offers = [];

    ws.on("error", this.emit.bind(this, "error"));
    ws.on("close", this.emit.bind(this, "error"));
    ws.on("message", this.onMessage.bind(this));
  }

  public getOffer(): string | undefined {
    return this.offers.pop();
  }

  public sendAnswer(answer: string) {
    const message: object = {
      payload: { answer },
      type: "answer"
    };

    this.ws.send(JSON.stringify(message));
  }

  public sendPeer(peer: object) {
    const message: object = {
      payload: { peer },
      type: "peer"
    };

    this.ws.send(JSON.stringify(message));
  }

  private onMessage(data: WebSocket.Data) {
    try {
      const {
        type,
        payload
      }: {
        type: string;
        payload: any;
      } = JSON.parse(data as string);

      switch (type) {
        case "find":
          Logger.debug("Received find message", {
            peerId: this.peerId
          });

          this.emit("find");

          break;
        case "offer":
          Logger.debug("Received offer message", {
            peerId: this.peerId
          });

          const { offer }: { offer: string } = payload;

          this.offers.push(offer);

          break;
        case "answer":
          Logger.debug("Received answer message", {
            peerId: this.peerId
          });

          const {
            peerId,
            answer
          }: { peerId: string; answer: string } = payload;

          this.emit("answer", peerId, answer);

          break;
        default:
          Logger.warn("Received an unknown message type", {
            data,
            peerId: this.peerId
          });
      }
    } catch (error) {
      Logger.warn("Error processing message", {
        data,
        error
      });
    }
  }
}
