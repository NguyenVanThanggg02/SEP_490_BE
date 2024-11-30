import bookingController from "../controllers/bookings.js";
import { BookingDAO, notificationDao } from "../dao/index.js";
import bcrypt from "bcrypt";
import { expect } from 'chai';
import sinon from 'sinon';
import Bookings from "../models/bookings.js";
import { transactionDao } from "../dao/transactionDao.js";
import Users from "../models/users.js";
describe("Booking Test", () => {

describe("checkHourAvailability", () => {
    let req, res, sandbox;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      req = {
        body: {
          spaceId: "123",
          dates: ["2024-12-01", "2024-12-02"],
          rentalType: "hour",
        },
      };
      res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub(),
      };
    });
  
    afterEach(() => {
      sandbox.restore();
    });
  
    it("should return available slots with status 200", async () => {
      const mockBookings = [
        {
          rentalType: "hour",
          selectedSlots: [
            { date: "2024-12-01", startTime: "08:00", endTime: "09:00" },
          ],
        },
      ];
  
      sandbox.stub(BookingDAO, "getBookingsBySpaceAndDates").resolves(mockBookings);
  
      await bookingController.checkHourAvailability(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(sinon.match.has("availableSlots"))).to.be.true;
    });
  
    it("should return taken dates with status 200 for day rental type", async () => {
      req.body.rentalType = "day";
      const mockBookings = [
        {
          rentalType: "day",
          selectedDates: ["2024-12-01T00:00:00.000Z"],
        },
      ];
  
      sandbox.stub(BookingDAO, "getBookingsBySpaceAndDates").resolves(mockBookings);
  
      await bookingController.checkHourAvailability(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          isAvailable: false,
          takenDates: sinon.match.array,
        })
      ).to.be.true;
    });
  
    it("should return status 500 if BookingDAO throws an error", async () => {
      sandbox.stub(BookingDAO, "getBookingsBySpaceAndDates").rejects(new Error("Database error"));
  
      await bookingController.checkHourAvailability(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(
        res.json.calledWith({
          message: sinon.match.string.and(sinon.match(/Database error/)),
        })
      ).to.be.true;
    });
  
    it("should handle invalid date formats in the request body", async () => {
      req.body.dates = ["invalid-date"];
      await bookingController.checkHourAvailability(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(
        res.json.calledWith({
          message: sinon.match.string.and(sinon.match(/Invalid date format/)),
        })
      ).to.be.true;
    });
  
    
      
  });

  
})
  