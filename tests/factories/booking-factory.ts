import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { User, Room } from "@prisma/client";

import { createBadroom } from "./hotels-factory";
import { createUser } from "./users-factory";

export async function bookingCreated(user?: User, Room?: Room) {
  const User = user || (await createUser());
  const room = Room || (await createBadroom());

  return prisma.booking.create({
    data: {
      userId: User.id,
      roomId: room.id,
    },
  });
}

export async function getBookingByBookingId(id: number) {
  return prisma.booking.findFirst({
    where: {
      id,
    },
  });
}
