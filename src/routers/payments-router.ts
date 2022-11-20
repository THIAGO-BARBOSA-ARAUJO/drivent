import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getPaymentsTicket, postPaymentsTicket } from "@/controllers/payments-controllers";

const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .get("/", getPaymentsTicket)
  .post("/process", postPaymentsTicket);

export { paymentsRouter };
