import Boom from "@hapi/boom";
import Ajv from "ajv";

export const errorHandler = async (ctx, next) => {
  try {
    await next();

    ctx.body = { success: true, payload: ctx.body };
  } catch (error) {
    let boomError: Boom;

    if (Boom.isBoom(error)) {
      boomError = error;
    } else {
      boomError = Boom.internal();

      if (error instanceof Ajv.ValidationError) {
        boomError = Boom.badData(error.message, error.errors);
      }
    }

    ctx.status = boomError.output.statusCode;
    ctx.body = {
      payload: {
        ...boomError.output.payload,
        details: boomError.data
      },
      success: false
    };

    ctx.app.emit("error", error, ctx);
  }
};
