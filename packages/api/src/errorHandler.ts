import { Logger } from "@bitstreamy/commons";
import Boom from "@hapi/boom";
import { ParameterizedContext } from "koa";
import { IRouterParamContext } from "koa-router";
import { NotFoundError, ValidationError } from "objection";
import {
  CheckViolationError,
  DataError,
  ForeignKeyViolationError,
  NotNullViolationError,
  UniqueViolationError
} from "objection-db-errors";

export const errorHandler = async (
  ctx: ParameterizedContext<any, IRouterParamContext<any, {}>>,
  next: () => Promise<any>
) => {
  try {
    await next();

    if (ctx.status === 404) {
      throw Boom.notFound();
    }

    ctx.body = { success: true, payload: ctx.body };
  } catch (error) {
    let boomError: Boom;

    if (Boom.isBoom(error)) {
      boomError = error;
    } else {
      boomError = Boom.internal();

      if (error instanceof ValidationError) {
        boomError = Boom.badData(error.message, error.data);
      } else if (error instanceof NotFoundError) {
        boomError = Boom.notFound(error.message);
      } else if (
        error instanceof UniqueViolationError ||
        error instanceof NotNullViolationError ||
        error instanceof ForeignKeyViolationError ||
        error instanceof CheckViolationError ||
        error instanceof DataError
      ) {
        boomError = Boom.badData("There is a problem with the payload");
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

    Logger.warn("Invalid request", { error });

    // ctx.app.emit("error", error, ctx);
  }
};
