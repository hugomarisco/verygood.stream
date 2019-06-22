import Router from "koa-router";
import { Category } from "../models/Category";

const categories = new Router();

categories.get("/", async (ctx, next) => {
  ctx.body = await Category.query();

  next();
});

export default categories;
