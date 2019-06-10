import Boom from "@hapi/boom";
import Ajv from "ajv";
import Router from "koa-router";
import { Stream } from "../models/Stream";
import streamSchema from "../schemas/stream.schema.json";

const ajv = new Ajv();

const streamsRouter = new Router();

streamsRouter.post("/", async (ctx, next) => {
  const stream = await ajv.validate(streamSchema, ctx.request.body);

  const persistedStream = await Stream.create(stream);

  ctx.body = persistedStream;

  next();
});

streamsRouter.get("/", async (ctx, next) => {
  const streams = await Stream.all();

  ctx.body = streams;

  next();
});

streamsRouter.get("/:streamId", async (ctx, next) => {
  const stream = await Stream.findById(ctx.params.streamId);

  if (stream) {
    ctx.body = stream;
  } else {
    throw Boom.notFound();
  }

  next();
});

export default streamsRouter;
