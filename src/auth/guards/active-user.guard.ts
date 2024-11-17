import { createParamDecorator } from '@nestjs/common';
import { ActiveUserData } from '../types';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx) => {
    const user = ctx.switchToHttp().getRequest()?.user;
    return field ? user?.[field] : user;
  },
);
