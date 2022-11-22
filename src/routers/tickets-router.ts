import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { postTickets, getTicketsTypes, getTickets } from "@/controllers/tickets-controllers";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketsTypes)
  .get("/", getTickets)
  .post("/", postTickets);

export { ticketsRouter };
