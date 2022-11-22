import {
  getAllTicketsType,
  PostTicket,
  getTickets,
  validateEventRegistration,
} from "@/repositories/tickets-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { Ticket, TicketType, TicketStatus } from "@prisma/client";
import { notFoundError } from "@/errors";

async function serviceTicketsTypeGet() {
  return await getAllTicketsType();
}

async function serviceTicketPost(ticketTypeId: number, userId: number) {
  const valid = await validateEventRegistration(userId);

  if (!valid) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findEnrollment(userId);

  const tickt = {
    ticketTypeId: ticketTypeId,
    enrollmentId: enrollment.id,
    status: TicketStatus.RESERVED,
  };

  await PostTicket(tickt);

  const validenrollment = await validateEventRegistration(userId);

  if (!validenrollment) throw notFoundError();

  const tickets = await getTickets(validenrollment.id);

  if (!tickets) throw notFoundError();

  return tickets;
}

async function serviceTicketsget(userId: number) {
  const validenrollment = await validateEventRegistration(userId);

  if (!validenrollment) throw notFoundError();

  const tickets = await getTickets(validenrollment.id);

  if (!tickets) throw notFoundError();

  return tickets;
}

export { serviceTicketsTypeGet, serviceTicketPost, serviceTicketsget };
