import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function getBookingRepository(userId: number): Promise<Booking> {
  return prisma.booking.findFirst({
    where: { userId },
    include: {
      Room: true
    }
  });
}

async function getBookingByIdRepository(id: number): Promise<Booking> {
  return prisma.booking.findFirst({
    where: {
      id
    }
  });
}

async function postBookingRepository(userId: number, roomId: number): Promise<Booking> {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function updateBookingRepository(id: number, roomId: number, userId: number): Promise<Booking> {
  return prisma.booking.update({
    where: {
      id
    },
    data: {
      roomId,
      userId
    }
  });
}

export const bookingsRepository = {
  getBookingRepository,
  postBookingRepository,
  updateBookingRepository,
  getBookingByIdRepository,
};
