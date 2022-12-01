import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import { bookingsService } from "@/services/bookings-service";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const userId = +req.userId;

  try {
    const booking = await bookingsService.getBookingService(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function postBookings(req: AuthenticatedRequest, res: Response) {
  const userId = +req.userId;
  const roomId = +req.body.roomId;

  try {
    const bookingId = await bookingsService.postBookingService(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: bookingId.id });
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

export async function updatetBooking(req: AuthenticatedRequest, res: Response) {
  const userId = +req.userId;
  const roomId = +req.body.roomId;
  const bookingId = +req.params.bookingId;

  try {
    const booking = await bookingsService.updatetBookingService(userId, roomId, bookingId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
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
