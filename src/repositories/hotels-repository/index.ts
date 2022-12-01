import { prisma } from "@/config";
import { Hotel, Room } from "@prisma/client";

async function getHotelsRepository(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function getHotelsById(id: number): Promise<Hotel> {
  return prisma.hotel.findFirst({
    where: {
      id,
    },
  });
}

async function getBedroomsRepository(id: number): Promise<Hotel[]> {
  return prisma.hotel.findMany({
    where: {
      id,
    },
    include: {
      Rooms: true
    },
  });
}

async function getRoomsRepository(id: number) {
  return prisma.room.findFirst({
    where: {
      id
    },
    include: {
      Booking: true,
      _count: {
        select: {
          Booking: true
        }
      }
    } 
  });
}

export { getHotelsRepository, getBedroomsRepository, getHotelsById, getRoomsRepository };
