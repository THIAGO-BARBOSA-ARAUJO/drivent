import { getHotelsRepository, getHotelsById, getBedroomsRepository } from "@/repositories/hotels-repository";
import { notFoundError, unauthorizedError, paymentRequiredError, ForbiddenError } from "@/errors";
import { getTickets, getTicketsByTicketId } from "@/repositories/tickets-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function getHotelsServices(userId: number) {
  const enrollmet = await enrollmentRepository.findEnrollment(userId);

  // verifica se o enrollment não existe
  if (!enrollmet) throw notFoundError();

  const ticketsAndTicktType = await getTickets(enrollmet.id);

  // verifica se não existe ticket
  if (!ticketsAndTicktType) throw notFoundError();

  // verifica se o ticket status está diferente de pago
  if (ticketsAndTicktType.status !== "PAID") throw paymentRequiredError();

  // verifica se o tipo do ticket não é presencial e não inclui o hotel
  if (ticketsAndTicktType.TicketType.isRemote !== false || ticketsAndTicktType.TicketType.includesHotel !== true)
    throw unauthorizedError();

  const hotels = await getHotelsRepository();

  return hotels;
}

async function getBedroomsServices(hotelId: number, userId: number) {
  const hotels = await getHotelsById(hotelId);

  //verifica se não existe hotels
  if (!hotels) throw notFoundError();

  const enrollmet = await enrollmentRepository.findEnrollment(userId);
  
  // verifica se o usuário não tem enrollment
  if (!enrollmet) throw notFoundError();

  const ticketsAndTicktType = await getTickets(enrollmet.id);

  // verifica se não existe ticket
  if (!ticketsAndTicktType) throw notFoundError();

  // verifica se o ticket status está diferente de pago
  if (ticketsAndTicktType.status !== "PAID") throw paymentRequiredError();

  // verifica se o tipo do ticket não é presencial e não inclui o hotel
  if (ticketsAndTicktType.TicketType.isRemote !== false || ticketsAndTicktType.TicketType.includesHotel !== true)
    throw unauthorizedError();

  const badrooms = await getBedroomsRepository(hotelId);

  return badrooms;
}

export { getHotelsServices, getBedroomsServices };
