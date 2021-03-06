import { Next } from 'koa';
import Joi from '@hapi/joi';
import { ErrCode } from '@common/enums';

interface Opts {
  schema?: Joi.ObjectSchema<any>;
}

export function paramValidate(opts: Opts) {
  return async (ctx: any, next: Next) => {
    const { schema } = opts;
    const contentType: string = ctx.headers['content-type'] || '';

    if (
      ctx.method === 'POST' &&
      !contentType.startsWith('multipart') &&
      !contentType.startsWith('application/json')
    ) {
      ctx.status = 400;
      ctx.body = 'content-type is not application/json';
      return;
    }

    if (schema) {
      const params = {
        ...ctx.params,
        ...(['POST', 'PUT'].includes(ctx.method) ? ctx.request.body : ctx.request.query),
      };

      const { error, value } = schema.validate(params, {
        allowUnknown: true, debug: process.env.NODE_ENV === 'development',
      });
      if (error) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: { code: ErrCode.BAD_PARAMS, message: error.message },
        };
        return;
      }

      ctx.params = value;
    }

    await next();
  };
}
