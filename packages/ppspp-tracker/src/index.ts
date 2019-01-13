import winston from "winston";
import WebSocket from "ws";
import { Peer } from "./Peer";

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const wss = new WebSocket.Server({ port });

let peers: Peer[] = [];

wss.on("listening", () => logger.info("Listening for connections", { port }));

wss.on("close", () => logger.info("Gracefully shutting down"));

wss.on("error", error => logger.error("Server error", { error }));

wss.on("connection", (ws, req) => {
  const connectedPeer = new Peer(ws);

  peers.push(connectedPeer);

  logger.info(`New peer connection`, {
    peerId: connectedPeer.peerId
  });

  ws.on("error", error => {
    logger.error(`Client error`, { error, peerId: connectedPeer.peerId });

    peers = peers.filter(peer => peer.peerId !== connectedPeer.peerId);
  });

  ws.on("close", () => {
    logger.info(`Peer closed the connection`, { peerId: connectedPeer.peerId });

    peers = peers.filter(peer => peer.peerId !== connectedPeer.peerId);
  });

  ws.on("message", rawMessage => {
    try {
      const { type, swarmId, payload } = JSON.parse(rawMessage as string);

      switch (type) {
        case "find":
          peers
            .filter(
              peer =>
                peer.peerId !== connectedPeer.peerId &&
                peer.swarmId === swarmId &&
                peer.hasOffers()
            )
            .forEach(peer =>
              ws.send(
                JSON.stringify({ type: "offer", payload: peer.getOffer() })
              )
            );

          break;
        case "offer":
          connectedPeer.addOffer(swarmId, payload.socketId, payload.offer);

          break;
        case "answer":
          peers.forEach(peer => peer.answer(payload.socketId, payload.answer));

          break;
      }
    } catch (error) {
      logger.error("Error processing message", { error, message: rawMessage });
    }
  });
});
