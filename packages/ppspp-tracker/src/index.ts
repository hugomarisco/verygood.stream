import UUID from "uuid";
import winston from "winston";
import WebSocket from "ws";
import { Offer } from "./Offer";

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const MAX_FIND_OFFERS = 10;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const wss = new WebSocket.Server({ port });

let offers: Offer[] = [];

wss.on("listening", () => logger.info("Listening for connections", { port }));

wss.on("close", () => logger.info("Gracefully shutting down"));

wss.on("error", error => logger.error("Server error", { error }));

wss.on("connection", (ws, req) => {
  const peerId = UUID.v4();

  logger.info(`New peer connection`, {
    ...req.connection,
    peerId
  });

  ws.on("error", error => {
    logger.error(`Client error`, { error, peerId });

    offers = offers.filter(offer => offer.peerId !== peerId);
  });

  ws.on("close", () => {
    logger.info(`Peer closed the connection`, { peerId });

    offers = offers.filter(offer => offer.peerId !== peerId);
  });

  ws.on("message", rawMessage => {
    try {
      const { type, swarmId, ...message } = JSON.parse(rawMessage as string);

      switch (type) {
        case "join":
        case "offers":
          offers = [
            ...offers,
            message.offers.map(
              (offer: string) => new Offer(swarmId, peerId, offer)
            )
          ];

          break;
        case "find":
          const { limit } = message;

          const offersFound = offers
            .filter(offer => offer.swarmId === swarmId)
            .slice(0, Math.min(limit, MAX_FIND_OFFERS));

          ws.send(JSON.stringify({ offers: offersFound }));

          break;
        case "leave":
          offers = offers.filter(offer => offer.swarmId !== swarmId);

          break;
      }
    } catch (error) {
      logger.error("Error processing message", { error, message: rawMessage });
    }
  });
});
