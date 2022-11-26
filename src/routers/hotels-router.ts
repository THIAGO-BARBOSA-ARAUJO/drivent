import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getBedrooms } from "@/controllers/hotels-controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getBedrooms);

export { hotelsRouter };
