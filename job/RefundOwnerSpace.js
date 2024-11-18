import Bookings from "../models/bookings.js";
import { transactionDao } from "../dao/transactionDao.js";

// Trả chủ space giờ + ngày
async function plusDay() {
  try {
    const bookingProcessList = await Bookings.find({
      ownerApprovalStatus: "accepted",
      endDate: { $lt: new Date() },
      rentalType: { $in: ["hour", "day"] },
      plusStatus: { $ne: "full_plus" }
    })
      .populate("spaceId")
      .populate("refundTransId");
    bookingProcessList.forEach(async (bookingProcess) => {
      let amount = Number(bookingProcess.totalAmount);
      amount = Number(amount) - Number(bookingProcess.refundTransId.amount);
      if (amount > 0) {
        const transaction = await transactionDao.transferMoneyBooking(
          bookingProcess.spaceId.userId,
          "Cộng tiền",
          "Thành công",
          bookingProcess.amount,
          `Tiền cho thuê không gian ${bookingProcess.spaceId.name}`
        );
        await Bookings.updateOne(
          { _id: bookingProcess._id.toString() },
          {
            $push: { plusTransId: transaction._id.toString() },
            plusStatus: "full_plus",
          }
        );
      } else {
        await Bookings.updateOne(
          { _id: bookingProcess._id.toString() },
          { plusStatus: "full_plus" }
        );
      }
    });
  } catch (error) {
    console.error("Error plus money", error);
  }
}

// Trả chủ space tuần
async function plusWeek() {
  try {
    const bookingProcessList = await Bookings.find({
      ownerApprovalStatus: "accepted",
      endDate: { $lt: new Date() },
      rentalType: "week",
      plusStatus: { $ne: "full_plus" }
    })
      .populate("spaceId")
      .populate("refundTransId");
    bookingProcessList.forEach(async (bookingProcess) => {
      let amount = Number(bookingProcess.totalAmount);
      amount = Number(amount) - Number(bookingProcess.refundTransId.amount);
      if (amount > 0) {
        const transaction = await transactionDao.transferMoneyBooking(
          bookingProcess.spaceId.userId,
          "Cộng tiền",
          "Thành công",
          amount,
          `Tiền cho thuê không gian ${bookingProcess.spaceId.name}`
        );
        await Bookings.updateOne(
          { _id: bookingProcess._id.toString() },
          {
            $push: { plusTransId: transaction._id.toString() },
            plusStatus: "full_plus",
          }
        );
      } else {
        await Bookings.updateOne(
          { _id: bookingProcess._id.toString() },
          { plusStatus: "full_plus" }
        );
      }
    });
  } catch (error) {
    console.error("Error plus money", error);
  }
}

// Trả chủ space tháng
async function plusMonth() {
  
  const now = new Date();
  try {
    const bookingProcessList = await Bookings.find({
      ownerApprovalStatus: "accepted",
      startDate: { $lt: new Date() },
      rentalType: "month",
      plusStatus: { $ne: "full_plus" }
    })
      .populate("spaceId")
      .populate("refundTransId")
      .populate("plusTransId");
    bookingProcessList.forEach(async (bookingProcess) => {
      if (bookingProcess.refundTransId) {
        let amount = Number(bookingProcess.totalAmount);
        amount = Number(amount) - Number(bookingProcess.refundTransId.amount);
        bookingProcess.plusTransId.forEach(plusTrans => amount = Number(amount) - Number(plusTrans.amount))
        if (amount > 0) {
          const transaction = await transactionDao.transferMoneyBooking(
            bookingProcess.spaceId.userId,
            "Cộng tiền",
            "Thành công",
            amount,
            `Tiền cho thuê không gian ${bookingProcess.spaceId.name}`
          );
          await Bookings.updateOne(
            { _id: bookingProcess._id.toString() },
            {
              $push: { plusTransId: transaction._id.toString() },
              plusStatus: "full_plus",
            }
          );
        }
      } else {
        let amount = Number(bookingProcess.totalAmount);
        bookingProcess.plusTransId.forEach(plusTrans => amount = Number(amount) - Number(plusTrans.amount));
        if (now.getDate() === 8) {
          // Tuần đầu
          const transaction = await transactionDao.transferMoneyBooking(
            bookingProcess.spaceId.userId,
            "Cộng tiền",
            "Thành công",
            bookingProcess.totalAmount * 25 / 100,
            `Tiền cho thuê không gian ${bookingProcess.spaceId.name} tuần 1`
          );
          await Bookings.updateOne(
            { _id: bookingProcess._id.toString() },
            {
              $push: { plusTransId: transaction._id.toString() },
              plusStatus: "1_plus",
            }
          );
          if (now.getDate() === 15) {
            // Tuần đầu
            const transaction = await transactionDao.transferMoneyBooking(
              bookingProcess.spaceId.userId,
              "Cộng tiền",
              "Thành công",
              bookingProcess.totalAmount * 25 / 100,
              `Tiền cho thuê không gian ${bookingProcess.spaceId.name} tuần 2`
            );
            await Bookings.updateOne(
              { _id: bookingProcess._id.toString() },
              {
                $push: { plusTransId: transaction._id.toString() },
                plusStatus: "2_plus",
              }
            );
          };
          if (now.getDate() === 22) {
            // Tuần đầu
            const transaction = await transactionDao.transferMoneyBooking(
              bookingProcess.spaceId.userId,
              "Cộng tiền",
              "Thành công",
              bookingProcess.totalAmount * 25 / 100,
              `Tiền cho thuê không gian ${bookingProcess.spaceId.name} tuần 3`
            );
            await Bookings.updateOne(
              { _id: bookingProcess._id.toString() },
              {
                $push: { plusTransId: transaction._id.toString() },
                plusStatus: "3_plus",
              }
            );
          };
          if (now.getDate() === 1) {
            // Tuần đầu
            const transaction = await transactionDao.transferMoneyBooking(
              bookingProcess.spaceId.userId,
              "Cộng tiền",
              "Thành công",
              amount,
              `Tiền cho thuê không gian ${bookingProcess.spaceId.name}`
            );
            await Bookings.updateOne(
              { _id: bookingProcess._id.toString() },
              {
                $push: { plusTransId: transaction._id.toString() },
                plusStatus: "full_plus",
              }
            );
          };
        }

      }
    });
  } catch (error) {
    console.error("Error plus money", error);
  }
}

export const refundOwnerSpace = {plusDay, plusWeek, plusMonth}