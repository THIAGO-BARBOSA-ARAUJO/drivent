import { prisma } from "@/config";
import { TicketType, Ticket, Enrollment } from "@prisma/client";

async function getAllTicketsType(): Promise<TicketType[]> {
  return prisma.ticketType.findMany();
}

async function PostTicket(ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt">) {
  return prisma.ticket.create({
    data: ticket,
  });
}

async function getTickets(enrollmentId: number): Promise<Ticket & { TicketType: TicketType }> {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });
}

async function validateEventRegistration(userid: number): Promise<Enrollment> {
  return prisma.enrollment.findFirst({
    where: {
      userId: userid,
    },
  });
}

export { getAllTicketsType, PostTicket, getTickets, validateEventRegistration };
