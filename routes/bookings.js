import express from "express";
import Bookings from "../models/bookings.js";

const bookingRouter = express.Router();

//list danh sách booking
bookingRouter.get("/", async (req, res, next) => {
  try {
    const bookings = await Bookings.find({})
      .populate("spaceId")
      .populate("userId")
      .exec();
    if (bookings.length === 0) {
      throw createError(404, "Không tìm thấy dịch vụ");
    }
    res.send(bookings);
  } catch (error) {
    next(error);
  }
});

// tạo mới booking

bookingRouter.post("/", async (req, res, next) => {
  try {
    const { userId, spaceId, checkIn, checkOut, timeSlot, notes } = req.body;

    // Check for required fields
    if (!userId || !spaceId || !checkIn || !checkOut || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate the time slot
    const { startTime, endTime } = timeSlot;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "Invalid time slot" });
    }

    // Create a new booking
    const newBooking = new Bookings({
      userId,
      spaceId,
      checkIn,
      checkOut,
      timeSlot: { startTime, endTime },
      notes,
      status: "awaiting payment",
    });

    // Save the new booking
    const savedBooking = await newBooking.save();

    res.status(201).json(savedBooking);
  } catch (error) {
    next(error);
  }
});



// Cập nhật trạng thái booking và lý do nếu chuyển thành 'cancel' api cho user
bookingRouter.put("/update-status/:id", async (req, res, next) => {
  try {
    const { cancelReason } = req.body; // Ensure the naming is consistent with the schema
    const updatedBooking = await Bookings.findByIdAndUpdate(
      req.params.id,
      { status: "canceled", cancelReason }, // Update status and cancelReason fields
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Không tìm thấy booking" });
    }

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

export default bookingRouter