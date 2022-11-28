import { getHotelsRepository, getHotelsById, getBedroomsRepository } from "@/repositories/hotels-repository";
import { notFoundError, unauthorizedError, paymentRequiredError, ForbiddenError } from "@/errors";
import { getTickets, getTicketsByTicketId } from "@/repositories/tickets-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function getHotelsServices(userId: number) {
  const enrollmet = await enrollmentRepository.findEnrollment(userId);

  if (!enrollmet) throw notFoundError();

  const ticketsAndTicktType = await getTickets(enrollmet.id);

  if (!ticketsAndTicktType) throw notFoundError();

  if (ticketsAndTicktType.status !== "PAID") throw paymentRequiredError();

  if (ticketsAndTicktType.TicketType.isRemote !== false || ticketsAndTicktType.TicketType.includesHotel !== true)
    throw unauthorizedError();

  const hotels = await getHotelsRepository();

  return hotels;
}

async function getBedroomsServices(hotelId: number, userId: number) {
  const hotels = await getHotelsById(hotelId);

  if (!hotels) throw notFoundError();

  const enrollmet = await enrollmentRepository.findEnrollment(userId);
  
  if (!enrollmet) throw notFoundError();

  const ticketsAndTicktType = await getTickets(enrollmet.id);

  if (!ticketsAndTicktType) throw notFoundError();

  if (ticketsAndTicktType.status !== "PAID") throw paymentRequiredError();

  if (ticketsAndTicktType.TicketType.isRemote !== false || ticketsAndTicktType.TicketType.includesHotel !== true)
    throw unauthorizedError();

  const badrooms = await getBedroomsRepository(hotelId);

  return badrooms;
}

export { getHotelsServices, getBedroomsServices };
