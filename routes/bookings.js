import express from "express";
import Bookings from "../models/bookings.js";
import BookingController from "../controllers/bookings.js";
import bookingDetail from "../models/bookingDetails.js";
import Spaces from "../models/spaces.js";
import axios from "axios";
import { mapboxToken } from "../helpers/constants.js";
import { transactionDao } from "../dao/transactionDao.js";


const bookingRouter = express.Router();

bookingRouter.get

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

// Endpoint kiểm tra khung giờ khả dụng
bookingRouter.post('/check-hour-availability', BookingController.checkHourAvailability);
bookingRouter.post('/check-day-availability', BookingController.checkDayAvailability);

// Endpoint để tạo đặt phòng mới
bookingRouter.post('/create', BookingController.createBooking);
bookingRouter.get("/bookingByUserId/:id", BookingController.getListBookingOfUser);



// Cập nhật trạng thái booking và lý do nếu chuyển thành 'cancel' api cho user
bookingRouter.put("/update-status/:id", async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body; // Ensure the naming is consistent with the schema
    if (status !== "completed" && status !== "canceled") {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedBooking = await Bookings.findByIdAndUpdate(
      req.params.id,
      { status, cancelReason: status === "canceled" ? cancelReason : undefined }, // Cập nhật cancelReason chỉ khi status là "canceled"
      { new: true }
    ).populate("userId")
    .populate("spaceId");;

    if (!updatedBooking) {
      return res.status(404).json({ message: "Không tìm thấy booking" });
    }
    // Nếu trạng thái là "completed", gửi email

    if (status === "completed") {
      await transactionDao.transferMoneyBooking(updatedBooking.userId._id.toString(), "Hoàn tiền", "Thành công", updatedBooking.totalAmount, `Hoàn tiền ${updatedBooking.spaceId.name}`)
      // const tenantEmail = updatedBooking.userId.gmail; // Giả sử bạn có trường email trong user
      // console.log(tenantEmail);

      // await sendEmailBookingCompleted.sendEmailBookingCompleted(tenantEmail, updatedBooking);
    }

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});


// api lấy 3 spaces có lượt book nhiều nhất theo quantity
bookingRouter.get("/top-spaces", async (req, res) => {
  try {
    const result = await bookingDetail.aggregate([
      {
        //Gom nhóm các order item theo productId và tính tổng số lượng của từng sp
        $group: {
          _id: "$spaceId",
          quantity: { $sum: "$quantity" },
          latestCreatedAt: { $max: "$createdAt" },
        },
      },
      // {
      //   $match: { quantity: { $gt: 0 } }, // Lọc sản phẩm có quantity > 0
      // },
      {
        $sort: { quantity: -1, latestCreatedAt: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "No space found" });
    }

    // Lấy thông tin chi tiết của các sản phẩm bán chạy nhất
    const topSpaces = await Spaces.find({
      _id: { $in: result.map((item) => item._id) },
    });

    // Gộp thông tin chi tiết với số lượng sản phẩm đã bán
    const topSpaceWithQuantity = topSpaces.map((s) => {
      const quantitySold = result.find((item) =>
        item._id.equals(s._id)
      ).quantity;
      // const totalPrice = s.price * quantitySold;
      return {
        // trả về đối tượng js với các thuộc tính của sp như id, name, price ...
        ...s.toObject(),
        quantity: quantitySold,
        // totalPrice: totalPrice,
      };
    });

    // sắp xếp địa điểm nhiều nhất lên đầu
    topSpaceWithQuantity.sort((a, b) => b.quantity - a.quantity);

    return res.status(200).json(topSpaceWithQuantity);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving the top products" });
  }
});


bookingRouter.get("/near-spaces", async (req, res) => {
  try {
    const {lat, lng} = req.query;
    let result = []
    if (lat && lng) {
      result = await Spaces.find({
        locationPoint: {
              $near: {
                  $geometry: {
                      type: "Point",
                      coordinates: [lng, lat]
                  }
              }
          }
      })
      .limit(3);
    } else {
      result = await Spaces.find()
        .sort({ updatedAt: -1 }) 
        .limit(3);
    }

    if (result.length === 0) {
      return res.status(200).json([]);
    }
    let resData = []
      for (let i = 0; i < result.length; i++) {
        resData.push({_id: result[i]._id, images: result[i].images, name: result[i].name, location: result[i].location, pricePerHour: result[i].pricePerHour})
        try {      
        const res = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat};${result[i].locationPoint.coordinates[0]},${result[i].locationPoint.coordinates[1]}`, {
          params: {
            access_token: mapboxToken
          }
        })
        if (res?.data?.routes && res.data.routes.length > 0 && res.data.routes[0].distance) {
          resData[i].distance = res.data.routes[0].distance >= 1000 ? `${Math.floor(res.data.routes[0].distance/1000)}km` : `${res.data.routes[0].distance}m`;
        }
      } catch (error) {
        console.log(error.message);
      }
      }
    return res.status(200).json(resData);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Error retrieving the top products" });
  }
});


//Duyệt booking của người dùng muốn thuê...
bookingRouter.put("/updateBookStatus/:id", async (req, res, next) => {
  try {
    const { ownerApprovalStatus, cancelReason } = req.body;

    // Validate the ownerApprovalStatus value
    if (!["pending", "accepted", "declined"].includes(ownerApprovalStatus)) {
      return res.status(400).json({ message: "Invalid owner approval status" });
    }

    // Prepare the update data
    const updateData = {
      ownerApprovalStatus,
    };

    // If the status is declined, add the cancelReason
    if (ownerApprovalStatus === "declined") {
      updateData.cancelReason = cancelReason;
    }

    const updatedBooking = await Bookings.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("userId")
      .populate("spaceId");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

// huỷ lịch book
bookingRouter.put("/:id/cancel", async (req, res) => {
  try {
    const booking = await Bookings.findById(req.params.id)
      .populate("userId")
      .populate("spaceId");

    if (!booking) {
      return res.status(404).json({ message: "Không tìm thấy booking" });
    }

    // Kiểm tra nếu trạng thái hoặc trạng thái phê duyệt của chủ sở hữu ngừng hủy
    if (
      booking.ownerApprovalStatus === "declined" ||
      booking.status === "canceled"
    ) {
      return res
        .status(400)
        .json({ message: "Không thể hủy booking ở trạng thái này" });
    }

    // Kiểm tra theo rentalType
    const currentDate = new Date();
    const startDate = new Date(booking.startDate); // Lấy thời gian bắt đầu của booking
    const timeDifference = startDate - currentDate; // Tính sự chênh lệch thời gian

    if (["hour", "day"].includes(booking.rentalType)) {
      // Nếu rentalType là "hour" hoặc "day", hủy trước 24 giờ
      if (timeDifference < 24 * 60 * 60 * 1000) { // 24 giờ tính bằng mili giây
        return res.status(400).json({ message: "Không thể hủy khi còn dưới 24 giờ" });
      }
    }  
    else if (booking.rentalType === "week") {
      const currentDate = new Date();
      const startDate = new Date(booking.startDate);
      const timeDifference = startDate - currentDate; // Tính sự chênh lệch thời gian
    
      // Kiểm tra nếu chưa sử dụng ngày nào (chưa đến ngày bắt đầu)
      if (timeDifference > 0) {
        // Chưa đến ngày bắt đầu, có thể hủy booking
        return res.json({ message: "Booking có thể hủy" });
      }
    
      // Kiểm tra nếu đã sử dụng hơn 3 ngày
      if (Math.abs(timeDifference) > 3 * 24 * 60 * 60 * 1000) { // Đã sử dụng hơn 3 ngày
        return res.status(400).json({ message: "Không thể hủy booking khi đã sử dụng hơn 3 ngày" });
      }
    }
    
    
    else if (booking.rentalType === "month") {
       const timeUsed = timeDifference / (1000 * 60 * 60 * 24); 
       // Kiểm tra nếu đã sử dụng quá 2 tuần (14 ngày)
        if (timeUsed > 14) {
          return res.status(400).json({ message: "Không thể hủy khi đã sử dụng quá 2 tuần" });
        }
    }

    // Tiến hành hủy booking
    booking.status = "canceled";
    booking.cancelReason = req.body.cancelReason; // Chọn lý do hủy
    booking.totalAmount = 0; // Đặt lại tổng số tiền
    await booking.save();

    return res.json({ message: "Booking đã được hủy thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi khi hủy booking" });
  }
});


// lấy các đơn book của người cho thuê
bookingRouter.get("/spaces/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const bookings = await Bookings.find({})
      .populate("spaceId")
      .populate("userId")
      .exec();
    const filteredBookings = bookings.filter(
      (booking) => booking.spaceId.userId.toString() === userId
    );
    if (filteredBookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user in their spaces" });
    }
    res.json(filteredBookings);
  } catch (error) {
    next(error);
  }
});

bookingRouter.put("/updatestatus/:id", async (req, res, next) => {
  try {
    const { ownerApprovalStatus, reasonOwnerRejected } = req.body;
    // Validate the ownerApprovalStatus value
    if (!["pending", "accepted", "declined"].includes(ownerApprovalStatus)) {
      return res.status(400).json({ message: "Invalid owner approval status" });
    }
    // Prepare the update data
    const updateData = {
      ownerApprovalStatus,
    };
    // If the status is declined, add the cancelReason
    if (ownerApprovalStatus === "declined") {
      updateData.reasonOwnerRejected = reasonOwnerRejected;
    }
    const updatedBooking = await Bookings.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("userId")
      .populate("spaceId");
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
});

export default bookingRouter  