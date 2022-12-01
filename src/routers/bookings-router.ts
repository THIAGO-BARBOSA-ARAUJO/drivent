import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBookings, postBookings, updatetBooking } from "@/controllers/bookings-controllers";
import { createRoomIdSchema } from "@/schemas/bookings-schema";
import { validateBody } from "@/middlewares";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", validateBody(createRoomIdSchema), postBookings)
  .put("/:bookingId", updatetBooking);

export { bookingsRouter };
