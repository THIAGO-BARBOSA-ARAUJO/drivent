import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import { Server } from "http";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createHotel,
  createBadroom,
  createUser,
  createEnrollmentWithAddress,
  createNotValidTicktType,
  createTycktTypeValid,
  createTicket,
  createBadroomCapacityFull,
  bookingCreated,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { connectDb } from "@/config";
import { alternatives, date, number, string } from "joi";
import { strict } from "assert";
import exp from "constants";
import { response } from "express";
import { getRoomsRepository } from "@/repositories/hotels-repository";

beforeAll(async () => {
  connectDb();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await api.get("/hotels");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const response = await api.get("/hotels").set("Authorization", "Bearer XXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await api.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if there is no booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      await createBadroom(hotel);

      const response = await api.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createBadroom(hotel);
      const booking = await bookingCreated(user, room);

      const response = await api.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: booking.id,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString(),
          },
        }),
      );
    });
  });
});

describe("Post /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const rooms = await createBadroom();
    const response = await api.post("/booking").send({ roomId: rooms.id });
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const rooms = await createBadroom();
    const response = await api.post("/booking").set("Authorization", "Bearer XXXX").send({ roomId: rooms.id });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const rooms = await createBadroom();
    const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: rooms.id });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if user has no enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const rooms = await createBadroom();

      const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if enrollment related ticket doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const rooms = await createBadroom();

      const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if ticket isn't paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const rooms = await createBadroom();
      const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket doesn't include hotel or is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createNotValidTicktType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const rooms = await createBadroom();

      const response = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if room not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createBadroom(hotel);

      const result = await api
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({
          roomId: room.id + 1,
        });
      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if roomId invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      await createBadroom(hotel);

      const result = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId: -1,
      });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if rooms have no vacancies", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const room = await createBadroomCapacityFull();

      const result = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId: room.id,
      });
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 if roomId valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createBadroom(hotel);

      const result = await api.post("/booking").set("Authorization", `Bearer ${token}`).send({
        roomId: room.id,
      });
      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        bookingId: result.body.bookingId,
      });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const user = await createUser();
    const rooms = await createBadroom();
    const booking = await bookingCreated(user);

    const response = await api.put(`/booking/${booking.id}`).send({ roomId: rooms.id });
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const user = await createUser();
    const rooms = await createBadroom();
    const booking = await bookingCreated(user);

    const response = await api
      .put(`/booking/${booking.id}`)
      .set("Authorization", "Bearer XXXX")
      .send({ roomId: rooms.id });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const rooms = await createBadroom();
    const booking = await bookingCreated(userWithoutSession);

    const response = await api
      .put(`/booking/${booking.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: rooms.id });

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 if user has no enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const rooms = await createBadroom();

      const booking = await bookingCreated(user);

      const response = await api
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 if enrollment related ticket doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const rooms = await createBadroom();
      const booking = await bookingCreated(user);

      const response = await api
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 if ticket isn't paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const rooms = await createBadroom();
      const booking = await bookingCreated(user);
      const response = await api
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket doesn't include hotel or is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createNotValidTicktType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const rooms = await createBadroom();
      const booking = await bookingCreated(user);

      const response = await api
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: rooms.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if roomId invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      await createBadroom(hotel);
      const booking = await bookingCreated(user);

      const result = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
        roomId: -1,
      });

      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if room not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const booking = await bookingCreated(user);

      const result = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
        roomId: 5,
      });
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if rooms have no vacancies", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const room = await createBadroomCapacityFull();
      const booking = await bookingCreated(user);

      const result = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
        roomId: room.id,
      });
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if bookingId not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const rooms = await createBadroom(hotel);
      const result = await api.put(`/booking/${5}`).set("Authorization", `Bearer ${token}`).send({
        roomId: rooms.id,
      });
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if reservation is not related to the user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const rooms = await createBadroom(hotel);
      const booking = await bookingCreated();
      const result = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
        roomId: rooms.id,
      });
      expect(result.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 if roomId valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTycktTypeValid();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const room = await createBadroom(hotel);
      const booking = await bookingCreated(user);

      const result = await api.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send({
        roomId: room.id,
      });
      expect(result.status).toBe(httpStatus.OK);
      expect(result.body).toEqual({
        bookingId: result.body.bookingId,
      });
    });
  });
});
