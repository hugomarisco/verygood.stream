#!/usr/bin/env node

import { Logger } from "@bitstreamy/commons";
import Boom from "@hapi/boom";
import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./errorHandler";
import router from "./routers";

const PORT = process.env.API_PORT || "5000";

const app = new Koa();

app
  .use(errorHandler)
  .use(cors({ origin: "http://192.168.1.70:5000" }))
  .use(
    bodyParser({
      onerror: err => {
        Logger.warn(err);
        throw Boom.badData();
      }
    })
  )
  .use(router.routes())
  .use(
    router.allowedMethods({
      methodNotAllowed: () => Boom.methodNotAllowed(),
      notImplemented: () => Boom.notImplemented(),
      throw: true
    })
  );

app.listen(parseInt(PORT, 10));

Logger.debug(`API is listening on port ${PORT}`);
