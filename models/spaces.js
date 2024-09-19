import mongoose, { Schema } from "mongoose";

const spacesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    rulesId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rules",
        required: true,
      },
    ],

    pricePerHour: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
    censorship: {
      type: String,
      enum: ["Chờ duyệt", "Chấp nhận ", "Từ chối"],
      default: "Chờ duyệt",
    },
    status: {
      type: String,
      enum: ["not available", "cleaning ", "available"],
      default: "available",
    },
    categoriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    appliancesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appliances",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reviews",
        require: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Spaces = mongoose.model("spaces", spacesSchema);

export default Spaces;
