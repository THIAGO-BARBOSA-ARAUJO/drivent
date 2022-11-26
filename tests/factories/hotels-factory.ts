import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Hotel } from "@prisma/client";

async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: "hotel cinco estrelas",
      image:
        "https://cdn.panrotas.com.br/portal-panrotas-statics/media-files-cache/301395/078fea0259c5b673bf2d35bcc14f0da5pestanaalvorsouthbeachexterior5/61,0,2424,1447/1206,720,0.24/0/default.jpg",
    },
  });
}

async function createBadroom(id: number) {
  return prisma.room.create({
    data: {
      name: "quato casal",
      capacity: 2,
      hotelId: id,
    },
  });
}

async function createTycktTypeValid() {
  return prisma.ticketType.create({
    data: {
      name: "valided",
      price: 600,
      isRemote: false,
      includesHotel: true,
    },
  });
}

async function createNotValidTicktType() {
  return prisma.ticketType.create({
    data: {
      name: "valided",
      price: 600,
      isRemote: true,
      includesHotel: true,
    },
  });
}

export { createHotel, createBadroom, createNotValidTicktType, createTycktTypeValid };
