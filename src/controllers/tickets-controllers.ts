import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import { serviceTicketPost, serviceTicketsTypeGet, serviceTicketsget } from "@/services/tickets-service";

async function getTicketsTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const resp = await serviceTicketsTypeGet();
    if (resp.length === 0) {
      return res.status(httpStatus.OK).send([]);
    }
    return res.status(httpStatus.OK).send(resp);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

async function postTickets(req: AuthenticatedRequest, res: Response) {
  const ticketTypeId = req.body.ticketTypeId as number;

  if (!ticketTypeId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const { userId } = req;
  try {
    const resp = await serviceTicketPost(ticketTypeId, userId);
    return res.status(httpStatus.CREATED).send(resp);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const resp = await serviceTicketsget(userId);
    return res.status(httpStatus.OK).send(resp);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export { postTickets, getTicketsTypes, getTickets };
