import dayjs from "dayjs";
import Users from "../models/users.js";
import Spaces from "../models/spaces.js";
import { TransactionsModel } from "../models/transactionsModel.js";
import Booking from "../models/bookings.js";

export const getAllData = async (req, res) => {
  try {
    // User dashboard========================================
    let userByMonths = [];
    for (let i = 0; i < 12; i++) {
      const month = dayjs().subtract(i, "month").format("YYYY-MM"); // Format as YYYY-MM
      userByMonths.push({
        month,
        count: 0,
      });
    }
    const userQuery = await Users.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    userByMonths = userByMonths.map((userByMonth) => {
      const i = userQuery.findIndex((user) => user._id === userByMonth.month);
      if (i >= 0) {
        return {
          ...userByMonth,
          count: userQuery[i].count,
        };
      } else {
        return userByMonth;
      }
    });
    const totalUser = await Users.countDocuments().lean();
    const totalUserIn12Months = userByMonths.reduce((count, userByMonth) => {
      return count + userByMonth.count;
    }, 0);
    const diff = Math.floor((totalUserIn12Months / totalUser) * 100);
    const user = {
      title: "Thành viên",
      value: totalUser,
      trend: diff > 0 ? "up" : diff === 0 ? "neutral" : "down",
      interval: "12 tháng",
      data: userByMonths.reverse().map((userByMonth) => userByMonth.count),
      dataLabel: userByMonths.map((userByMonth) => userByMonth.month),
      trendValue: `${diff < 0 ? "" : "+"}${diff}%`,
    };

    // Space dashboard========================================
    let spaceByMonths = [];
    for (let i = 0; i < 12; i++) {
      const month = dayjs().subtract(i, "month").format("YYYY-MM"); // Format as YYYY-MM
      spaceByMonths.push({
        month,
        count: 0,
      });
    }
    const spaceQuery = await Spaces.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    spaceByMonths = spaceByMonths.map((spaceByMonth) => {
      const i = spaceQuery.findIndex(
        (space) => space._id === spaceByMonth.month
      );
      if (i >= 0) {
        return {
          ...spaceByMonth,
          count: spaceQuery[i].count,
        };
      } else {
        return spaceByMonth;
      }
    });
    const totalSpace = await Spaces.countDocuments().lean();
    const totalSpaceIn12Months = spaceByMonths.reduce((count, spaceByMonth) => {
      return count + spaceByMonth.count;
    }, 0);
    const diffSpace = Math.floor((totalSpaceIn12Months / totalSpace) * 100);
    const space = {
      title: "Không gian",
      value: totalSpace,
      trend: diffSpace > 0 ? "up" : diffSpace === 0 ? "neutral" : "down",
      interval: "12 tháng",
      data: userByMonths.map((userByMonth) => userByMonth.count),
      dataLabel: userByMonths.map((userByMonth) => userByMonth.month),
      trendValue: `${diffSpace < 0 ? "" : "+"}${diffSpace}%`,
    };

    // Transaction =================
    let transactionByMonths = [];
    for (let i = 0; i < 6; i++) {
      const month = dayjs().subtract(i, "month").format("YYYY-MM"); // Format as YYYY-MM
      transactionByMonths.push({
        month,
        minusAmount: 0,
        plusAmount: 0,
        refundAmount: 0,
      });
    }
    const minusQuery = await TransactionsModel.aggregate([
      {
        $match: {
          type: "Trừ tiền",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 6,
      },
    ]);
    const plusQuery = await TransactionsModel.aggregate([
      {
        $match: {
          type: "Cộng tiền",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 6,
      },
    ]);
    const refundQuery = await TransactionsModel.aggregate([
      {
        $match: {
          type: "Hoàn tiền",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 6,
      },
    ]);

    transactionByMonths = transactionByMonths.map((transactionByMonth) => {
      const newValue = { ...transactionByMonth };
      let i = minusQuery.findIndex(
        (minus) => minus._id === transactionByMonth.month
      );
      if (i >= 0) {
        newValue.minusAmount = minusQuery[i].totalAmount;
      }
      i = plusQuery.findIndex((plus) => plus._id === transactionByMonth.month);
      if (i >= 0) {
        newValue.plusAmount = plusQuery[i].totalAmount;
      }
      i = refundQuery.findIndex(
        (refund) => refund._id === transactionByMonth.month
      );
      if (i >= 0) {
        newValue.refundAmount = refundQuery[i].totalAmount;
      }
      return newValue;
    });

    let totalMinusAmount = await TransactionsModel.aggregate([
      {
        $match: {
          type: "Trừ tiền",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    totalMinusAmount =
      totalMinusAmount.length > 0 ? totalMinusAmount[0].totalAmount : 0;
    let totalPlusRefundAmount = await TransactionsModel.aggregate([
      {
        $match: {
          $or: [{ type: "Cộng tiền" }, { type: "Hoàn tiền" }],
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    totalPlusRefundAmount =
      totalPlusRefundAmount.length > 0
        ? totalPlusRefundAmount[0].totalAmount
        : 0;
    const revenue6Months = transactionByMonths.reduce((r, transaction) => {
      return (
        r +
        transaction.minusAmount -
        transaction.plusAmount -
        transaction.refundAmount
      );
    }, 0);
    const a = transactionByMonths.map((transaction) => transaction.month);
    const b = transactionByMonths.map((transaction) => transaction.minusAmount);
    const c = transactionByMonths.map((transaction) => transaction.plusAmount);
    const d = transactionByMonths.map(
      (transaction) => transaction.refundAmount
    );
    const transaction = {
      title: "Thống kê giao dịch",
      axis: a,
      data: [
        {
          label: "Trừ tiền",
          data: b,
        },
        {
          label: "Cộng tiền",
          data: c,
        },
        {
          label: "Hoàn tiền",
          data: d,
        },
      ],
      revenue6Months: revenue6Months,
      revenue: totalMinusAmount - totalPlusRefundAmount,
    };

    // Space trạng thái ===================
    const spaceCensorshipQuery = await Spaces.aggregate([
      {
        $group: {
          _id: "$censorship",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const acceptCount = spaceCensorshipQuery.find(
      (item) => item._id === "Chấp nhận"
    )?.count || 0;
    const waitCount = spaceCensorshipQuery.find(
      (item) => item._id === "Chờ duyệt"
    ).count || 0;
    const rejectCount = spaceCensorshipQuery.find(
      (item) => item._id === "Từ chối"
    ).count || 0;
    const spaceCensorship = {
      title: "Trạng thái phê duyệt Không gian",
      data: [
        {label: "Chờ phê duyệt", value: waitCount},
        {label: "Đồng ý", value: acceptCount},
        {label: "Từ chối", value: rejectCount},
      ],
      total: waitCount + acceptCount + rejectCount
    };

    // booking ============================    
    let bookingByDays = [];
    for (let i = 0; i < 30; i++) {
      const day = dayjs().subtract(i, "day").format("YYYY-MM-DD"); // Format as YYYY-MM
      bookingByDays.push({
        day,
        rentalTypeHour: 0,
        rentalTypeDay: 0,
        rentalTypeMonth: 0,
      });
    }
    bookingByDays = bookingByDays.reverse()
    const bookingQuery = await Booking.aggregate([
      {
        $group: {
          _id: {
            createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            rentalType: "$rentalType" 
          },
          count: { $sum: 1 } 
        }
      },
      {
        $sort: { "_id.createdAt": 1 }
      }
    ]);
    bookingByDays = bookingByDays.map((bookingByDay) => {
      const newBookingByDay = {...bookingByDay}
      const bookingOnDay = bookingQuery.filter(booking => booking._id.createdAt === bookingByDay.day);
      const bHour = bookingOnDay.find(booking => booking._id.rentalType === 'hour');
      if (bHour) newBookingByDay.rentalTypeHour = bHour.count;
      const bDay = bookingOnDay.find(booking => booking._id.rentalType === 'day');
      if (bDay) newBookingByDay.rentalTypeDay = bDay.count;
      const bMonth = bookingOnDay.find(booking => booking._id.rentalType === 'month');
      if (bMonth) newBookingByDay.rentalTypeMonth = bMonth.count;
      return newBookingByDay;
    })
    const totalBooking1Month = bookingByDays.reduce((r, bookingByDay) => {return r + bookingByDay.rentalTypeDay + bookingByDay.rentalTypeHour + bookingByDay.rentalTypeMonth}, 0)
    const bookingRentalType = {
      title: "Số lượng booking",
      total: totalBooking1Month,
      interval: "Số lượng booking trong 30 ngày gần nhất",
      data: [
        {
          
        label: "Book theo giờ",
        data: bookingByDays.map(booking => booking.rentalTypeHour)
        }, 
        {
          
        label: "Book theo ngày",
        data: bookingByDays.map(booking => booking.rentalTypeDay)
        }, 
        {
          
        label: "Book theo tháng",
        data: bookingByDays.map(booking => booking.rentalTypeMonth)
        }, 
      ],
      axis: bookingByDays.map(booking => dayjs(booking.day).format('MMM DD'))
    }

    res.status(200).json({ user, space, transaction, spaceCensorship, bookingRentalType });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};
