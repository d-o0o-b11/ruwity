import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CtxUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): ParameterDecorator => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
