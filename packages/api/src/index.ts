import Boom from "@hapi/boom";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./errorHandler";
import { Logger } from "./Logger";
import router from "./routers";

const PORT = process.env.API_PORT || "5000";

const app = new Koa();

app
  .use(errorHandler)
  .use(bodyParser())
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
