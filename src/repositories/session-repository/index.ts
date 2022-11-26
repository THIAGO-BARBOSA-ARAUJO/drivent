import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

async function create(data: Prisma.SessionUncheckedCreateInput) {
  return prisma.session.create({
    data,
  });
}

async function getSession(userId: number) {
  return prisma.session.findFirst({
    where: {
      userId
    }
  });
}

const sessionRepository = {
  create,
  getSession
};

export default sessionRepository;
