import mongoose, { Schema } from "mongoose";

const spacesSchema = new Schema(
  {
    locationPoint: {
      type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
      },
      coordinates: {
          type: [Number],
          index: '2dsphere'
      }
    },
    latLng: {
      type: Array(Number),
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    rulesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rules",
      required: true,
    },

    communityStandardsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "communityStandards",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    pricePerHour: {
      type: Number,
    },
    pricePerDay: {
      type: Number,
    },
    pricePerWeek: {
      type: Number,
    },
    pricePerMonth: {
      type: Number,
    },
    images: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
          required: true
        }
      }
    ],
    censorship: {
      type: String,
      enum: ["Chờ duyệt", "Chấp nhận", "Từ chối"],
      default: "Chờ duyệt",
    },
    status: {
      type: String,
      enum: ["Đang sử dụng", "Đang dọn dẹp", "Còn trống"],
      default: "Đang sử dụng",
    },
    categoriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    appliancesId:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appliances",
      required: true,
    },
    room: {
      type: String,
    },
    isGoldenHour: { type: Boolean, default: false },
    goldenHourDetails: {
      startTime: { type: String },
      endTime: { type: String },
      priceIncrease: { type: Number },
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reviews",
        require: false,
      },
    ],
    reportCount: {
      type: Number,
      default: 0,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    isUpdate: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Spaces = mongoose.model("spaces", spacesSchema);

export default Spaces;
