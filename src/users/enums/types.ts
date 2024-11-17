import { roleEnum } from 'src/database/schema';

export type Role = (typeof roleEnum.enumValues)[number];
