#!/usr/bin/env node

import { Logger } from "@bitstreamy/commons";
import { Server } from ".";

const port = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 2000;

const tracker = new Server(port);

tracker.on("listening", () =>
  Logger.info("Listening for connections", { port })
);

tracker.on("close", () => Logger.info("Gracefully shutting down"));

tracker.on("error", (error: Error) => {
  Logger.error("Server error", { error });

  throw error;
});
