import { reportsDao, notificationDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";
import Users from "../models/users.js";

const getAllReports = async(req, res) =>{
  try {
    const allReports = await reportsDao.fetchAllReports()
    res.status(200).json(allReports)
  } catch (error) {
    throw new Error(error.message)
  }
}

const createReports = async (req, res) => {
  try {
    const { reasonId, userId, spaceId, customReason, } = req.body;
    
     // Kiểm tra xem người dùng đã báo cáo không gian này chưa
     const existingReport = await reportsDao.findReportByUserAndSpace(userId, spaceId);
     if (existingReport) {
       return res.status(400).json({ message: "Bạn đã báo cáo không gian này trước đó rồi." });
     }

    const report = await reportsDao.createReports(reasonId, userId, spaceId, customReason,);

    const space = await Spaces.findById(spaceId);
    const user = await Users.findById(userId);
    const userAvatar = user?.avatar || "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg";

    if (space.reportCount >= 3) {
      await Spaces.findByIdAndUpdate(
        spaceId,
        { censorship: "Chờ duyệt" },
        { new: true }
      );
    
      await notificationDao.saveAndSendNotification(
        space.userId.toString(),
        `${space.name} đã chuyển sang trạng thái thành chờ duyệt do bị tố cáo quá 3 lần.`,
        userAvatar
      );
    }

    await notificationDao.saveAndSendNotification(
      space.userId.toString(),
      `${user?.fullname} đã tố cáo space ${space?.name}`,
      userAvatar
    );
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

export default { createReports,getAllReports };
