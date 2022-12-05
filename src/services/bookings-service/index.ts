import { bookingsRepository } from "@/repositories/bookings-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { getRoomsRepository } from "@/repositories/hotels-repository";
import { getAllTicketsType, getTickets } from "@/repositories/tickets-repository";
import { TicketStatus } from "@prisma/client";
import { notFoundError, ForbiddenError } from "@/errors";
import { Booking } from "@prisma/client";

async function getBookingService(userId: number) {
  const bookings = await bookingsRepository.getBookingRepository(userId);
  if (!bookings) throw notFoundError();

  return bookings;
}

async function postBookingService(userId: number, roomId: number) {
  const enrollmet = await enrollmentRepository.findEnrollment(userId);

  if (!enrollmet) throw ForbiddenError();

  const ticketsAndTicktType = await getTickets(enrollmet.id);

  if (!ticketsAndTicktType) throw ForbiddenError();

  if (ticketsAndTicktType.status !== "PAID") throw ForbiddenError();

  if (ticketsAndTicktType.TicketType.isRemote !== false || ticketsAndTicktType.TicketType.includesHotel !== true)
    throw ForbiddenError();

  if (!roomId) throw ForbiddenError();

  if (roomId < 1) throw ForbiddenError();
  
  const rooms = await getRoomsRepository(roomId);
  if (!rooms) throw notFoundError();

  if (rooms._count.Booking >= rooms.capacity) throw ForbiddenError();

  const booking = await bookingsRepository.postBookingRepository(userId, roomId);
  return booking;
}

async function updatetBookingService(userId: number, roomId: number, bookingId: number) {
  if(!roomId) throw notFoundError();
  
  if(roomId <= 0) throw ForbiddenError();

  const enrollmet = await enrollmentRepository.findEnrollment(userId); //

  if (!enrollmet) throw ForbiddenError(); //

  const ticketsAndTicktType = await getTickets(enrollmet.id); //

  if (!ticketsAndTicktType) throw ForbiddenError(); //

  if (ticketsAndTicktType.status !== "PAID") throw ForbiddenError(); //

  if (ticketsAndTicktType.TicketType.isRemote !== false || ticketsAndTicktType.TicketType.includesHotel !== true)
    throw ForbiddenError(); //

  const booking = await bookingsRepository.getBookingByIdRepository(bookingId); //

  if (!booking) throw ForbiddenError();//

  if(booking.userId !== userId) throw ForbiddenError();//

  const room = await getRoomsRepository(roomId);//

  if (!room) throw notFoundError();//

  if (room._count.Booking >= room.capacity) throw ForbiddenError();

  return bookingsRepository.updateBookingRepository(bookingId, roomId, userId);//
}

export type CreateRoomIdParams = Pick<Booking, "roomId">;

export const bookingsService = { getBookingService, postBookingService, updatetBookingService };
