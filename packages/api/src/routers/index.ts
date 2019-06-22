import Router from "koa-router";
import broadcasts from "./broadcasts";
import categories from "./categories";

const router = new Router();

router.use("/broadcasts", broadcasts.routes(), broadcasts.allowedMethods());
router.use("/categories", categories.routes(), categories.allowedMethods());

export default router;
