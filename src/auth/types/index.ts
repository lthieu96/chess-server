import { roleEnum } from 'src/database/schema';

export type ActiveUserData = {
  sub: number;
  email: string;
  role: (typeof roleEnum.enumValues)[number];
};
