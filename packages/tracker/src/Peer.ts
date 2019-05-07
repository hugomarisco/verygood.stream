import { EventEmitter } from "events";
import { v4 as UUIDv4 } from "uuid";
import WebSocket from "ws";
import { Logger } from "./Logger";
import { Offer } from "./Offer";

export class Peer extends EventEmitter {
  public peerId: string;
  private ws: WebSocket;
  private offers: { [wrtcSocketId: string]: Offer };

  constructor(ws: WebSocket) {
    super();

    this.peerId = UUIDv4();
    this.ws = ws;
    this.offers = {};

    ws.on("error", this.emit.bind(this, "error"));
    ws.on("close", this.emit.bind(this, "error"));
    ws.on("message", this.onMessage.bind(this));
  }

  public getOffer(): Offer | null {
    const wrtcSocketIds = Object.keys(this.offers);

    if (wrtcSocketIds.length === 0) {
      return null;
    }

    const wrtcSocketId = wrtcSocketIds[0];

    const offer = this.offers[wrtcSocketId];

    delete this.offers[wrtcSocketId];

    return offer;
  }

  public sendAnswer(peerId: string, socketId: string, signalData: string) {
    const message: object = {
      payload: { peerId, socketId, signalData },
      type: "answer"
    };

    this.ws.send(JSON.stringify(message));
  }

  public sendOffer(peerId: string, offer: Offer) {
    const message: object = {
      payload: {
        peerId,
        signalData: offer.signalData,
        socketId: offer.wrtcSocketId
      },
      type: "offer"
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

          this.offers[payload.socketId] = new Offer(
            payload.socketId,
            payload.signalData
          );

          break;
        case "answer":
          Logger.debug("Received answer message", {
            peerId: this.peerId
          });

          this.emit(
            "answer",
            payload.peerId,
            payload.socketId,
            payload.signalData
          );

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
