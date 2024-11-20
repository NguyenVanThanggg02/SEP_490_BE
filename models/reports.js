import mongoose, { Schema } from "mongoose";

const reportsSchema = new Schema(
  {
    reasonId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reasons",
      },
    ],
    customReason: {
      type: String, 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "spaces",
    },
  },
  { timestamps: true }
);

const Reports = mongoose.model("reports", reportsSchema);
export default Reports;
