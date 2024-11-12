import mongoose, { Schema } from "mongoose";

const systemPropertiesSchema = new Schema(
  {
    code: {
      type: String,
      required: true,      
      enum: ["system_account_balance"],
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SystemProrperties = mongoose.model("systemProrperties", systemPropertiesSchema);
export default SystemProrperties;
