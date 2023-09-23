import { PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

export const UserSeed = async (transaction: Omit<PrismaClient, ITXClientDenyList>) => {

};
