import { CreateRoomIdParams } from "@/services/bookings-service";
import Joi from "joi";

export const createRoomIdSchema = Joi.object<CreateRoomIdParams>({
  roomId: Joi.number().required(),
});
