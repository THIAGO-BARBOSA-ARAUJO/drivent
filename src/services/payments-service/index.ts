import { getPaymentsRepository, PostPaymentRepository } from "@/repositories/payments-repository";
import { getTicketsByTicketId, updateTicket } from "@/repositories/tickets-repository";
import { Payment, TicketStatus } from "@prisma/client";
import { notFoundError, unauthorizedError } from "@/errors";
import { Process } from "@/protocols";

async function getPaymentsServices(ticketId: number, userId: number): Promise<Payment> {
  const payments = await getPaymentsRepository(ticketId);

  const ticket = await getTicketsByTicketId(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.Enrollment.userId !== userId) {
    throw unauthorizedError();
  }

  return payments;
}

async function PostPaymentsServices(process: Process, userId: number): Promise<Payment> {
  const ticket = await getTicketsByTicketId(process.ticketId);

  if (!ticket) throw notFoundError();

  if (ticket.Enrollment.userId !== userId) throw unauthorizedError();

  await updateTicket({ status: TicketStatus.PAID }, process.ticketId);

  return await PostPaymentRepository({
    ticketId: process.ticketId,
    value: ticket.TicketType.price,
    cardIssuer: process.cardData.issuer,
    cardLastDigits: `${process.cardData.number}`.slice(-4),
  });
}

export { getPaymentsServices, PostPaymentsServices };
