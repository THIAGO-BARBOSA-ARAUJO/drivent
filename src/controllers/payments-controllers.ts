import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import { getPaymentsServices, PostPaymentsServices } from "@/services/payments-service";
import { Process } from "@/protocols";

async function getPaymentsTicket(req: AuthenticatedRequest, res: Response) {
  const ticketId = req.query.ticketId as Record<string, string>;
  if (!ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const ticketIdNumber = +ticketId;
  const { userId } = req;

  try {
    const payments = await getPaymentsServices(ticketIdNumber, userId);
    return res.status(httpStatus.OK).send(payments);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}

async function postPaymentsTicket(req: AuthenticatedRequest, res: Response) {
  const process = req.body as Process;
  const { userId } = req;

  if (!process.cardData || !process.ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await PostPaymentsServices(process, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}

export { getPaymentsTicket, postPaymentsTicket };
