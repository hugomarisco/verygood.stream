import Router from "koa-router";
import streamsRouter from "./streamsRouter";

const router = new Router();

router.use("/streams", streamsRouter.routes(), streamsRouter.allowedMethods());

export default router;
