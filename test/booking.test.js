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

  describe("checkDayAvailability", () => {
    let req, res, sandbox;
  
    beforeEach(() => {
      sandbox = sinon.createSandbox();
  
      // Mock request and response objects
      req = {
        body: {
          spaceId: "test-space-id",
          dates: ["2024-12-01", "2024-12-02", "2024-12-03"],
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
  
    it("should return all days as available when there are no bookings", async () => {
      sandbox.stub(BookingDAO, "getBookingsBySpaceAndDates").resolves([]);
  
      await bookingController.checkDayAvailability(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
  
      const expectedResponse = {
        availableSlots: [
          { date: "Sun Dec 01 2024", isAvailable: true },
          { date: "Mon Dec 02 2024", isAvailable: true },
          { date: "Tue Dec 03 2024", isAvailable: true },
        ],
      };
  
      expect(res.json.calledWith(expectedResponse)).to.be.true;
    });
  
    it("should return some days as unavailable when bookings exist", async () => {
      const mockBookings = [
        {
          selectedSlots: [{ date: "2024-12-01" }],
        },
      ];
  
      sandbox.stub(BookingDAO, "getBookingsBySpaceAndDates").resolves(mockBookings);
  
      await bookingController.checkDayAvailability(req, res);
  
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
  
      const expectedResponse = {
        availableSlots: [
          { date: "Sun Dec 01 2024", isAvailable: false },
          { date: "Mon Dec 02 2024", isAvailable: true },
          { date: "Tue Dec 03 2024", isAvailable: true },
        ],
      };
  
      expect(res.json.calledWith(expectedResponse)).to.be.true;
    });
  
    it("should handle invalid date formats in the request", async () => {
      req.body.dates = ["invalid-date", "2024-12-02"];
  
      await bookingController.checkDayAvailability(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: sinon.match("Invalid date format"),
        })
      ).to.be.true;
    });
  
    it("should handle errors from the DAO layer gracefully", async () => {
      sandbox.stub(BookingDAO, "getBookingsBySpaceAndDates").throws(new Error("Database error"));
  
      await bookingController.checkDayAvailability(req, res);
  
      expect(res.status.calledWith(500)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: sinon.match("Database error"),
        })
      ).to.be.true;
    });
  });

  describe('getListBookingOfUser', () => {
    let fetchListBookingOfUserStub;
  
    beforeEach(() => {
      fetchListBookingOfUserStub = sinon.stub(BookingDAO, 'fetchListBookingOfUser');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return booking list and status 200 when bookings are found', async () => {
      const fakeBookingList = [
        {
          _id: 'bookingId123',
          userId: 'userId123',
          items: [{ spaceId: 'spaceId123' }],
          isAllowCancel: true,
        },
      ];
  
      fetchListBookingOfUserStub.resolves(fakeBookingList);
  
      const req = { params: { id: 'userId123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      await bookingController.getListBookingOfUser(req, res);
  
      expect(fetchListBookingOfUserStub.calledOnceWith('userId123')).to.be.true;
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.json.calledOnceWith(fakeBookingList)).to.be.true;
    });
  
    it('should return 404 if no bookings are found', async () => {
      fetchListBookingOfUserStub.resolves([]);
  
      const req = { params: { id: 'userId123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      await bookingController.getListBookingOfUser(req, res);
  
      expect(fetchListBookingOfUserStub.calledOnceWith('userId123')).to.be.true;
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith('Not Found')).to.be.true;
    });
  
    it('should return 500 if an error occurs during fetching bookings', async () => {
      fetchListBookingOfUserStub.rejects(new Error('Database error'));
  
      const req = { params: { id: 'userId123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      await bookingController.getListBookingOfUser(req, res);
  
      expect(fetchListBookingOfUserStub.calledOnceWith('userId123')).to.be.true;
      expect(res.status.calledOnceWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "Error: Database error" })).to.be.true;
    });
  
    it('should return booking list with populated spaceId', async () => {
      const fakeBookingList = [
        {
          _id: 'bookingId123',
          userId: 'userId123',
          items: [{ spaceId: 'spaceId123' }],
          isAllowCancel: true,
        },
      ];
  
      fetchListBookingOfUserStub.resolves(fakeBookingList);
  
      const req = { params: { id: 'userId123' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      await bookingController.getListBookingOfUser(req, res);
  
      expect(fetchListBookingOfUserStub.calledOnceWith('userId123')).to.be.true;
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.json.calledOnceWith(fakeBookingList)).to.be.true;
    });
  
    it('should return an empty array if there are no bookings for the user', async () => {
      fetchListBookingOfUserStub.resolves([]);
  
      const req = { params: { id: 'userId456' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
  
      await bookingController.getListBookingOfUser(req, res);
  
      expect(fetchListBookingOfUserStub.calledOnceWith('userId456')).to.be.true;
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith('Not Found')).to.be.true;
    });
  });
  
  
})
  