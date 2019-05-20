import Koa from "koa";
import Router from "koa-router";
import { ISwarms } from "./Tracker";

export const httpApi = (swarms: ISwarms): Koa => {
  const app = new Koa();
  const router = new Router();

  router.get("/swarms", async (ctx, next) => {
    ctx.body = Object.values(swarms).map(({ swarmId, peers }) => ({
      peerCount: Object.keys(peers).length,
      swarmId
    }));

    next();
  });

  app.use(router.routes()).use(router.allowedMethods());

  return app;
};
