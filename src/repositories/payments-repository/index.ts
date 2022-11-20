import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function getPaymentsRepository(ticketId: number): Promise<Payment> {
  return prisma.payment.findFirst({
    where: {
      ticketId,
    },
  });
}

async function PostPaymentRepository(inserted: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
  return prisma.payment.create({
    data: inserted
  });
}

export { getPaymentsRepository, PostPaymentRepository };
