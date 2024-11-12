import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Nạp tiền", "Trừ tiền", "Cộng tiền", "Hoàn tiền", "Rút tiền"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Khởi tạo", "Thành công", "Thất bại"],
      required: true,
    },
    beneficiaryAccountNumber: {
      type: String,
    },
    beneficiaryBankCode: {
      type: String,
    },
    originalTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transactions",
    },
  },
  {
    timestamps: true,
  }
);

const TransactionsModel = mongoose.model("transactions", transactionSchema);

export {TransactionsModel};
