import mongoose, { Schema } from "mongoose";

const bookingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: "spaces",
      required: true,
    },
    startDate: {
      // Previously checkIn
      type: Date,
      required: true,
    },
    endDate: {
      // Previously checkOut
      type: Date,
      required: true,
    },
    rentalType: {
      // New field to specify rental type
      type: String,
      enum: ["hour", "day", "week", "month"],
      required: true,
    },
    selectedSlots: [
      // To store time slots when renting by hour
      {
        date: { type: Date },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
    selectedDates: [Date],
    status: {
      type: String,
      enum: ["awaiting payment", "completed", "canceled"],
      default: "awaiting payment",
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bookingDetails",
      },
    ],
    totalAmount: {
      type: String,
    },
    notes: {
      type: String,
      required: false,
    },
    cancelReason: {
      type: String,
      required: false,
    },
    timeSlot: {
      startTime: { type: String, required: false },
      endTime: { type: String, required: false },
    },
    ownerApprovalStatus: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Bookings = mongoose.model("bookings", bookingsSchema);

export default Bookings;
