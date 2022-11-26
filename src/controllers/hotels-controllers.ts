import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import { getHotelsServices, getBedroomsServices } from "@/services/hotels-service";

async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId  = +req.userId;
  
  try {
    const hotels = await getHotelsServices(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

async function getBedrooms(req: AuthenticatedRequest, res: Response) {
  const hotelId = Number(req.params.hotelId);
  const userId = +req.userId;
  
  try {
    const bedrooms = await getBedroomsServices(hotelId, userId);
    return res.status(httpStatus.OK).send(bedrooms);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export { getHotels, getBedrooms };
