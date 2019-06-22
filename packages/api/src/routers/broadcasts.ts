import { base64UrlUnescape } from "@bitstreamy/commons";
import Boom from "@hapi/boom";
import Router from "koa-router";
import { pick } from "lodash";
import { hashIds } from "../hashIds";
import { Broadcast } from "../models/Broadcast";

const broadcasts = new Router();

broadcasts.post("/", async (ctx, next) => {
  const broadcast = pick(ctx.request.body, [
    "title",
    "categoryId",
    "swarmId",
    "chunkSize",
    "chunkAddressingMethod",
    "contentIntegrityProtectionMethod",
    "liveSignatureAlgorithm"
  ]);

  ctx.body = await Broadcast.query()
    .eager("category")
    .insert(broadcast)
    .returning("*");

  next();
});

broadcasts.get("/", async (ctx, next) => {
  const { swarmId } = ctx.query;

  if (!swarmId) {
    throw Boom.badData();
  }

  ctx.body = await Broadcast.query()
    .eager("category")
    .where({ swarmId: base64UrlUnescape(swarmId) })
    .limit(1);

  next();
});

broadcasts.get("/:broadcastId", async (ctx, next) => {
  const broadcast = await Broadcast.query()
    .eager("category")
    .findById(hashIds.decode(ctx.params.broadcastId).join(""));

  if (broadcast) {
    ctx.body = broadcast;
  } else {
    throw Boom.notFound();
  }

  next();
});

broadcasts.patch("/:broadcastId", async (ctx, next) => {
  const broadcast = pick(ctx.request.body, [
    "title",
    "categoryId",
    "chunkSize",
    "chunkAddressingMethod",
    "contentIntegrityProtectionMethod",
    "liveSignatureAlgorithm"
  ]);

  ctx.body = await Broadcast.query()
    .eager("category")
    .findById(hashIds.decode(ctx.params.broadcastId).join(""))
    .patch(broadcast)
    .returning("*");

  next();
});

export default broadcasts;
