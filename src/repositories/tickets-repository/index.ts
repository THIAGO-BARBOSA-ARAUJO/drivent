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

async function getTicketsByTicketId(id: number) {
  return prisma.ticket.findFirst({
    where: {
      id,
    },
    include: {
      Enrollment: true,
      TicketType: true,
    },
  });
}

async function updateTicket(status: Partial<Omit<Ticket, "id">>, id: number) {
  return prisma.ticket.update({
    where: {
      id
    },
    data: status
  });
}

export { getAllTicketsType, PostTicket, getTickets, validateEventRegistration, getTicketsByTicketId, updateTicket };
